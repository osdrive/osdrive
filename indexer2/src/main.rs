use std::env;
use std::ffi::CString;
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::io::RawFd;
use std::path::Path;
use std::ptr;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use std::time::Instant;

const ROOT: &str = "/System/Volumes/Data";
const DEFAULT_BULK_BUFFER_SIZE: usize = 4 * 1024 * 1024;

const ATTR_BIT_MAP_COUNT: u16 = 5;
const ATTR_CMN_RETURNED_ATTRS: u32 = 0x8000_0000;
const ATTR_CMN_NAME: u32 = 0x0000_0001;
const ATTR_CMN_OBJTYPE: u32 = 0x0000_0008;

const FSOPT_NOFOLLOW: u64 = 0x0000_0001;
const FSOPT_PACK_INVAL_ATTRS: u64 = 0x0000_0008;

const VREG: u32 = 1;
const VDIR: u32 = 2;

#[repr(C)]
struct AttrList {
    bitmapcount: u16,
    reserved: u16,
    commonattr: u32,
    volattr: u32,
    dirattr: u32,
    fileattr: u32,
    forkattr: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
struct AttrReference {
    attr_dataoffset: i32,
    attr_length: u32,
}

unsafe extern "C" {
    fn getattrlistbulk(
        dirfd: libc::c_int,
        alist: *mut AttrList,
        attribute_buffer: *mut libc::c_void,
        buffer_size: libc::size_t,
        options: u64,
    ) -> libc::ssize_t;
}

#[derive(Default)]
struct WalkStats {
    dirs_seen: u64,
    files_seen: u64,
    warnings: u64,
}

struct SharedStats {
    dirs_seen: AtomicU64,
    files_seen: AtomicU64,
    warnings: AtomicU64,
}

impl SharedStats {
    fn snapshot(&self) -> WalkStats {
        WalkStats {
            dirs_seen: self.dirs_seen.load(Ordering::Relaxed),
            files_seen: self.files_seen.load(Ordering::Relaxed),
            warnings: self.warnings.load(Ordering::Relaxed),
        }
    }
}

enum EntryKind {
    File,
    Directory,
    Other,
}

enum BulkReadError {
    Io(io::Error),
    Parse(&'static str),
}

struct ParsedEntry {
    kind: EntryKind,
    name_range: Option<(usize, usize)>,
}

fn open_directory(path: &Path) -> Result<RawFd, io::Error> {
    let c_path = CString::new(path.as_os_str().as_bytes())
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "path contains null byte"))?;

    let dirfd = unsafe { libc::open(c_path.as_ptr(), libc::O_RDONLY | libc::O_DIRECTORY) };
    if dirfd < 0 {
        return Err(io::Error::last_os_error());
    }

    Ok(dirfd)
}

fn open_directory_at(
    parent_fd: RawFd,
    name: &[u8],
    scratch: &mut Vec<u8>,
) -> Result<RawFd, io::Error> {
    // Names returned by `getattrlistbulk` originate from the kernel, so they cannot contain NUL.
    scratch.clear();
    scratch.extend_from_slice(name);
    scratch.push(0);

    let dirfd = unsafe {
        libc::openat(
            parent_fd,
            scratch.as_ptr().cast(),
            libc::O_RDONLY | libc::O_DIRECTORY,
        )
    };
    if dirfd < 0 {
        return Err(io::Error::last_os_error());
    }

    Ok(dirfd)
}

struct DirFrame {
    fd: RawFd,
}

struct WorkState {
    stack: Vec<DirFrame>,
    active_workers: usize,
}

impl Drop for DirFrame {
    fn drop(&mut self) {
        unsafe {
            libc::close(self.fd);
        }
    }
}

fn refill_buffer(dirfd: RawFd, buffer: &mut [u8]) -> Result<usize, BulkReadError> {
    let mut attrlist = AttrList {
        bitmapcount: ATTR_BIT_MAP_COUNT,
        reserved: 0,
        commonattr: ATTR_CMN_RETURNED_ATTRS | ATTR_CMN_NAME | ATTR_CMN_OBJTYPE,
        volattr: 0,
        dirattr: 0,
        fileattr: 0,
        forkattr: 0,
    };

    loop {
        let result = unsafe {
            getattrlistbulk(
                dirfd,
                &mut attrlist,
                buffer.as_mut_ptr().cast(),
                buffer.len(),
                FSOPT_NOFOLLOW | FSOPT_PACK_INVAL_ATTRS,
            )
        };

        if result >= 0 {
            return Ok(result as usize);
        }

        let error = io::Error::last_os_error();
        if error.raw_os_error() == Some(libc::EINTR) {
            continue;
        }

        return Err(BulkReadError::Io(error));
    }
}

fn warn_with_path(stats: &SharedStats, path: &Path, error: &impl std::fmt::Display) {
    stats.warnings.fetch_add(1, Ordering::Relaxed);
    eprintln!("warning: skipping {}: {}", path.display(), error);
}

fn warn_directory(stats: &SharedStats, error: &impl std::fmt::Display) {
    stats.warnings.fetch_add(1, Ordering::Relaxed);
    eprintln!("warning: skipping directory: {}", error);
}

fn bulk_buffer_size() -> usize {
    env::var("INDEXER_BULK_BUFFER_SIZE")
        .ok()
        .and_then(|value| value.parse::<usize>().ok())
        .filter(|&value| value >= 4096)
        .unwrap_or(DEFAULT_BULK_BUFFER_SIZE)
}

fn worker_count() -> usize {
    env::var("INDEXER_THREADS")
        .ok()
        .and_then(|value| value.parse::<usize>().ok())
        .filter(|&value| value > 0)
        .unwrap_or_else(|| {
            thread::available_parallelism()
                .map(|count| count.get())
                .unwrap_or(4)
        })
}

fn walk_dir(root: &Path) -> WalkStats {
    let stats = Arc::new(SharedStats {
        dirs_seen: AtomicU64::new(0),
        files_seen: AtomicU64::new(0),
        warnings: AtomicU64::new(0),
    });

    let root_frame = match open_directory(root) {
        Ok(fd) => DirFrame { fd },
        Err(error) => {
            warn_with_path(&stats, root, &error);
            return stats.snapshot();
        }
    };

    let shared = Arc::new((
        Mutex::new(WorkState {
            stack: vec![root_frame],
            active_workers: 0,
        }),
        Condvar::new(),
    ));
    let done = Arc::new(AtomicBool::new(false));
    let worker_count = worker_count();
    let bulk_buffer_size = bulk_buffer_size();

    thread::scope(|scope| {
        for _ in 0..worker_count {
            let shared = Arc::clone(&shared);
            let done = Arc::clone(&done);
            let stats = Arc::clone(&stats);

            scope.spawn(move || {
                let mut buffer = vec![0; bulk_buffer_size];
                let mut openat_name = Vec::new();
                let mut local_stats = WalkStats::default();

                loop {
                    let dir = {
                        let (lock, condvar) = &*shared;
                        let mut state = lock.lock().unwrap();

                        loop {
                            if let Some(dir) = state.stack.pop() {
                                state.active_workers += 1;
                                break dir;
                            }

                            if done.load(Ordering::Relaxed) {
                                flush_local_stats(&stats, &mut local_stats);
                                return;
                            }

                            if state.active_workers == 0 {
                                done.store(true, Ordering::Relaxed);
                                condvar.notify_all();
                                flush_local_stats(&stats, &mut local_stats);
                                return;
                            }

                            state = condvar.wait(state).unwrap();
                        }
                    };

                    process_dir(
                        dir,
                        &shared,
                        &done,
                        &stats,
                        &mut local_stats,
                        &mut buffer,
                        &mut openat_name,
                    );
                }
            });
        }
    });

    stats.snapshot()
}

fn process_dir(
    dir: DirFrame,
    shared: &Arc<(Mutex<WorkState>, Condvar)>,
    done: &Arc<AtomicBool>,
    stats: &Arc<SharedStats>,
    local_stats: &mut WalkStats,
    buffer: &mut [u8],
    openat_name: &mut Vec<u8>,
) {
    local_stats.dirs_seen += 1;
    let mut discovered_dirs = Vec::new();

    'dir: loop {
        let entry_count = match refill_buffer(dir.fd, buffer) {
            Ok(0) => break,
            Ok(entry_count) => entry_count,
            Err(BulkReadError::Io(error)) => {
                warn_directory(stats, &error);
                break;
            }
            Err(BulkReadError::Parse(error)) => {
                warn_directory(stats, &error);
                break;
            }
        };

        let mut offset = 0usize;
        discovered_dirs.clear();

        for _ in 0..entry_count {
            let entry_start = offset;
            let (entry, entry_end) = match parse_bulk_entry(buffer, entry_start) {
                Ok(parsed) => parsed,
                Err(BulkReadError::Parse(error)) => {
                    stats.warnings.fetch_add(1, Ordering::Relaxed);
                    eprintln!(
                        "warning: skipping remainder of directory after bulk parse failure: {}",
                        error
                    );
                    break 'dir;
                }
                Err(BulkReadError::Io(error)) => {
                    warn_directory(stats, &error);
                    break 'dir;
                }
            };

            offset = entry_end;

            match entry.kind {
                EntryKind::Directory => {
                    let Some((name_start, name_end)) = entry
                        .name_range
                        .map(|(start, end)| (entry_start + start, entry_start + end))
                    else {
                        stats.warnings.fetch_add(1, Ordering::Relaxed);
                        eprintln!("warning: skipping directory: missing directory name");
                        continue;
                    };

                    let name = &buffer[name_start..name_end];
                    let child_fd = match open_directory_at(dir.fd, name, openat_name) {
                        Ok(fd) => fd,
                        Err(error) => {
                            warn_directory(stats, &error);
                            continue;
                        }
                    };

                    discovered_dirs.push(DirFrame { fd: child_fd });
                }
                EntryKind::File => {
                    local_stats.files_seen += 1;
                }
                EntryKind::Other => {}
            }
        }

        if !discovered_dirs.is_empty() {
            let discovered_count = discovered_dirs.len();
            let (lock, condvar) = &**shared;
            let mut state = lock.lock().unwrap();
            state.stack.append(&mut discovered_dirs);
            if discovered_count == 1 {
                condvar.notify_one();
            } else {
                condvar.notify_all();
            }
        }
    }

    finish_dir(shared, done);
}

fn flush_local_stats(stats: &SharedStats, local_stats: &mut WalkStats) {
    if local_stats.dirs_seen != 0 {
        stats
            .dirs_seen
            .fetch_add(local_stats.dirs_seen, Ordering::Relaxed);
        local_stats.dirs_seen = 0;
    }

    if local_stats.files_seen != 0 {
        stats
            .files_seen
            .fetch_add(local_stats.files_seen, Ordering::Relaxed);
        local_stats.files_seen = 0;
    }

    if local_stats.warnings != 0 {
        stats
            .warnings
            .fetch_add(local_stats.warnings, Ordering::Relaxed);
        local_stats.warnings = 0;
    }
}

fn finish_dir(shared: &Arc<(Mutex<WorkState>, Condvar)>, done: &Arc<AtomicBool>) {
    let (lock, condvar) = &**shared;
    let mut state = lock.lock().unwrap();
    state.active_workers -= 1;

    if state.active_workers == 0 && state.stack.is_empty() {
        done.store(true, Ordering::Relaxed);
        condvar.notify_all();
    } else {
        condvar.notify_one();
    }
}

fn parse_bulk_entry(
    buffer: &[u8],
    start_offset: usize,
) -> Result<(ParsedEntry, usize), BulkReadError> {
    const ENTRY_LENGTH_OFFSET: usize = 0;
    const COMMONATTR_OFFSET: usize = 4;
    const ATTR_SET_SIZE: usize = 20;
    const NAME_REFERENCE_SIZE: usize = std::mem::size_of::<AttrReference>();

    let entry_length = read_u32(buffer, start_offset + ENTRY_LENGTH_OFFSET)
        .ok_or(BulkReadError::Parse("missing entry length"))? as usize;

    if entry_length == 0 {
        return Err(BulkReadError::Parse("invalid entry length"));
    }

    let entry_end = start_offset
        .checked_add(entry_length)
        .ok_or(BulkReadError::Parse("entry length overflow"))?;
    let entry = buffer
        .get(start_offset..entry_end)
        .ok_or(BulkReadError::Parse("entry extends past buffer"))?;

    if entry.len() < 4 + ATTR_SET_SIZE {
        return Err(BulkReadError::Parse("entry too short"));
    }

    let returned_commonattr =
        read_u32(entry, COMMONATTR_OFFSET).ok_or(BulkReadError::Parse("missing commonattr"))?;

    let mut offset = 4 + ATTR_SET_SIZE;

    let name_range = if returned_commonattr & ATTR_CMN_NAME != 0 {
        let reference_offset = offset;
        let attr_reference = read_attr_reference(entry, reference_offset)?;
        offset += NAME_REFERENCE_SIZE;
        Some(parse_name_range(entry, reference_offset, attr_reference)?)
    } else {
        None
    };

    let kind = if returned_commonattr & ATTR_CMN_OBJTYPE != 0 {
        match read_u32(entry, offset).ok_or(BulkReadError::Parse("missing object type"))? {
            VDIR => EntryKind::Directory,
            VREG => EntryKind::File,
            _ => EntryKind::Other,
        }
    } else {
        EntryKind::Other
    };

    Ok((ParsedEntry { kind, name_range }, entry_end))
}

fn read_attr_reference(entry: &[u8], offset: usize) -> Result<AttrReference, BulkReadError> {
    let attr_dataoffset =
        read_i32(entry, offset).ok_or(BulkReadError::Parse("missing attrreference offset"))?;
    let attr_length =
        read_u32(entry, offset + 4).ok_or(BulkReadError::Parse("missing attrreference length"))?;

    Ok(AttrReference {
        attr_dataoffset,
        attr_length,
    })
}

fn parse_name_range(
    entry: &[u8],
    reference_offset: usize,
    attr_reference: AttrReference,
) -> Result<(usize, usize), BulkReadError> {
    let string_start = reference_offset as isize + attr_reference.attr_dataoffset as isize;
    if string_start < 0 {
        return Err(BulkReadError::Parse("negative attribute reference offset"));
    }

    let string_start = string_start as usize;
    let string_end = string_start
        .checked_add(attr_reference.attr_length as usize)
        .ok_or(BulkReadError::Parse("attribute reference overflow"))?;

    if string_end > entry.len() {
        return Err(BulkReadError::Parse(
            "invalid offset in attribute reference",
        ));
    }

    let trimmed_end = if string_end > string_start && entry[string_end - 1] == 0 {
        string_end - 1
    } else {
        string_end
    };

    Ok((string_start, trimmed_end))
}

fn read_u32(buffer: &[u8], offset: usize) -> Option<u32> {
    let end = offset.checked_add(4)?;
    if end > buffer.len() {
        return None;
    }

    Some(unsafe { ptr::read_unaligned(buffer.as_ptr().add(offset).cast::<u32>()) })
}

fn read_i32(buffer: &[u8], offset: usize) -> Option<i32> {
    let end = offset.checked_add(4)?;
    if end > buffer.len() {
        return None;
    }

    Some(unsafe { ptr::read_unaligned(buffer.as_ptr().add(offset).cast::<i32>()) })
}

fn main() {
    let start = Instant::now();
    let stats = walk_dir(Path::new(ROOT));

    println!(
        "dirs={} files={} warnings={} took={:?}",
        stats.dirs_seen,
        stats.files_seen,
        stats.warnings,
        start.elapsed()
    );
}
