//! Filesystem indexer

#[cfg(not(target_os = "macos"))]
compile_error!("macOS is only supported atm! Other OS's coming soon...");

use std::ffi::{CString, OsStr};
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::io::RawFd;
use std::path::{Path, PathBuf};
use std::ptr;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Condvar, Mutex};
use std::thread;

const DEFAULT_BULK_BUFFER_SIZE: usize = 1024 * 1024;
const MAX_WORKERS: usize = 32;

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

enum EntryKind {
    File,
    Directory,
    Other,
}

pub enum WalkEvent<'a> {
    Dir(&'a Path),
    File(&'a Path),
    Warning {
        path: &'a Path,
        error: &'a dyn std::fmt::Display,
    },
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum WalkControl {
    Continue,
    SkipDir,
}

enum BulkReadError {
    Io(io::Error),
    Parse(&'static str),
}

struct ParsedEntry {
    kind: EntryKind,
    name_range: Option<(usize, usize)>,
}

struct ScopedDir {
    fd: RawFd,
}

struct OpenDirWork {
    path: PathBuf,
    dir: ScopedDir,
}

struct WorkState {
    stack: Vec<PathBuf>,
    active_workers: usize,
}

impl Drop for ScopedDir {
    fn drop(&mut self) {
        unsafe {
            libc::close(self.fd);
        }
    }
}

fn open_directory(path: &Path) -> Result<ScopedDir, io::Error> {
    let c_path = CString::new(path.as_os_str().as_bytes())
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "path contains null byte"))?;

    let dirfd = unsafe { libc::open(c_path.as_ptr(), libc::O_RDONLY | libc::O_DIRECTORY) };
    if dirfd < 0 {
        return Err(io::Error::last_os_error());
    }

    Ok(ScopedDir { fd: dirfd })
}

fn open_directory_at(
    parent_fd: RawFd,
    name: &[u8],
    scratch: &mut Vec<u8>,
) -> Result<ScopedDir, io::Error> {
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

    Ok(ScopedDir { fd: dirfd })
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

fn worker_count() -> usize {
    thread::available_parallelism()
        .map(|count| count.get().saturating_mul(2).min(MAX_WORKERS))
        .unwrap_or(8)
}

/// Walks a directory tree in parallel with per-worker user state.
///
/// Each worker initializes its own state with `init`, receives traversal events
/// through `visit`, and returns its final state when traversal completes. The
/// caller merges those worker-local states with `reduce` to produce the final
/// result.
///
/// Returning [`WalkControl::SkipDir`] from a [`WalkEvent::Dir`] visit prevents
/// traversal into that directory.
///
/// # Example
///
/// ```no_run
/// use od_indexer::{WalkControl, WalkEvent, walk_dir};
/// use std::path::Path;
///
/// #[derive(Default)]
/// struct Stats {
///     dirs: u64,
///     files: u64,
/// }
///
/// let stats = walk_dir(
///     Path::new("/tmp"),
///     Stats::default,
///     |event, stats| match event {
///         WalkEvent::Dir(path) => {
///             if path.file_name().is_some_and(|name| name == "target") {
///                 WalkControl::SkipDir
///             } else {
///                 stats.dirs += 1;
///                 WalkControl::Continue
///             }
///         }
///         WalkEvent::File(_) => {
///             stats.files += 1;
///             WalkControl::Continue
///         }
///         WalkEvent::Warning { path, error } => {
///             eprintln!("warning: skipping {}: {}", path.display(), error);
///             WalkControl::Continue
///         }
///     },
///     |mut a, b| {
///         a.dirs += b.dirs;
///         a.files += b.files;
///         a
///     },
/// );
///
/// println!("dirs={} files={}", stats.dirs, stats.files);
/// ```
pub fn walk_dir<S, Init, Visit, Reduce>(root: &Path, init: Init, visit: Visit, reduce: Reduce) -> S
where
    S: Send,
    Init: Fn() -> S + Sync + Send,
    Visit: Fn(WalkEvent<'_>, &mut S) -> WalkControl + Sync + Send,
    Reduce: Fn(S, S) -> S,
{
    let shared = Arc::new((
        Mutex::new(WorkState {
            stack: vec![root.to_path_buf()],
            active_workers: 0,
        }),
        Condvar::new(),
    ));
    let done = Arc::new(AtomicBool::new(false));
    let worker_count = worker_count();

    thread::scope(|scope| {
        let init = &init;
        let visit = &visit;
        let mut workers = Vec::with_capacity(worker_count);

        for _ in 0..worker_count {
            let shared = Arc::clone(&shared);
            let done = Arc::clone(&done);

            workers.push(scope.spawn(move || {
                let mut buffer = vec![0; DEFAULT_BULK_BUFFER_SIZE];
                let mut next_child_name = Vec::new();
                let mut openat_name = Vec::new();
                let mut sibling_dirs = Vec::new();
                let mut state = init();

                loop {
                    let Some(path) = acquire_work(&shared, &done) else {
                        return state;
                    };

                    process_dir_chain(
                        path,
                        &shared,
                        &done,
                        &visit,
                        &mut state,
                        &mut buffer,
                        &mut next_child_name,
                        &mut openat_name,
                        &mut sibling_dirs,
                    );
                }
            }));
        }

        let mut merged = workers
            .pop()
            .expect("walk_dir always spawns at least one worker")
            .join()
            .unwrap();

        for worker in workers {
            merged = reduce(merged, worker.join().unwrap());
        }

        merged
    })
}

fn acquire_work(
    shared: &Arc<(Mutex<WorkState>, Condvar)>,
    done: &Arc<AtomicBool>,
) -> Option<PathBuf> {
    let (lock, condvar) = &**shared;
    let mut state = lock.lock().unwrap();

    loop {
        if let Some(path) = state.stack.pop() {
            state.active_workers += 1;
            return Some(path);
        }

        if done.load(Ordering::Relaxed) {
            return None;
        }

        if state.active_workers == 0 {
            done.store(true, Ordering::Relaxed);
            condvar.notify_all();
            return None;
        }

        state = condvar.wait(state).unwrap();
    }
}

fn process_dir_chain<S, Visit>(
    start_path: PathBuf,
    shared: &Arc<(Mutex<WorkState>, Condvar)>,
    done: &Arc<AtomicBool>,
    visit: &Visit,
    state: &mut S,
    buffer: &mut [u8],
    next_child_name: &mut Vec<u8>,
    openat_name: &mut Vec<u8>,
    sibling_dirs: &mut Vec<PathBuf>,
) where
    Visit: Fn(WalkEvent<'_>, &mut S) -> WalkControl,
{
    let mut pending = Some(start_path);
    let mut next_open_dir = None;

    loop {
        let current = if let Some(open_dir) = next_open_dir.take() {
            open_dir
        } else {
            let path = pending
                .take()
                .expect("path must exist while draining DFS chain");

            if matches!(visit(WalkEvent::Dir(&path), state), WalkControl::SkipDir) {
                break;
            }

            let dir = match open_directory(&path) {
                Ok(dir) => dir,
                Err(error) => {
                    visit(
                        WalkEvent::Warning {
                            path: &path,
                            error: &error,
                        },
                        state,
                    );
                    break;
                }
            };

            OpenDirWork { path, dir }
        };

        next_open_dir = process_open_dir(
            current,
            shared,
            visit,
            state,
            buffer,
            next_child_name,
            openat_name,
            sibling_dirs,
        );

        if next_open_dir.is_none() {
            break;
        }
    }

    finish_work(shared, done);
}

fn process_open_dir<S, Visit>(
    current: OpenDirWork,
    shared: &Arc<(Mutex<WorkState>, Condvar)>,
    visit: &Visit,
    state: &mut S,
    buffer: &mut [u8],
    next_child_name: &mut Vec<u8>,
    openat_name: &mut Vec<u8>,
    sibling_dirs: &mut Vec<PathBuf>,
) -> Option<OpenDirWork>
where
    Visit: Fn(WalkEvent<'_>, &mut S) -> WalkControl,
{
    sibling_dirs.clear();
    next_child_name.clear();
    let mut next_child_path = None;

    'dir: loop {
        let entry_count = match refill_buffer(current.dir.fd, buffer) {
            Ok(0) => break,
            Ok(entry_count) => entry_count,
            Err(BulkReadError::Io(error)) => {
                visit(
                    WalkEvent::Warning {
                        path: &current.path,
                        error: &error,
                    },
                    state,
                );
                break;
            }
            Err(BulkReadError::Parse(error)) => {
                visit(
                    WalkEvent::Warning {
                        path: &current.path,
                        error: &error,
                    },
                    state,
                );
                break;
            }
        };

        let mut offset = 0usize;

        for _ in 0..entry_count {
            let entry_start = offset;
            let (entry, entry_end) = match parse_bulk_entry(buffer, entry_start) {
                Ok(parsed) => parsed,
                Err(BulkReadError::Parse(error)) => {
                    visit(
                        WalkEvent::Warning {
                            path: &current.path,
                            error: &error,
                        },
                        state,
                    );
                    break 'dir;
                }
                Err(BulkReadError::Io(error)) => {
                    visit(
                        WalkEvent::Warning {
                            path: &current.path,
                            error: &error,
                        },
                        state,
                    );
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
                        visit(
                            WalkEvent::Warning {
                                path: &current.path,
                                error: &"missing directory name",
                            },
                            state,
                        );
                        continue;
                    };

                    let name = &buffer[name_start..name_end];
                    let child_path = current.path.join(Path::new(OsStr::from_bytes(name)));

                    if matches!(
                        visit(WalkEvent::Dir(&child_path), state),
                        WalkControl::SkipDir
                    ) {
                        continue;
                    }

                    if next_child_path.is_none() {
                        next_child_name.extend_from_slice(name);
                        next_child_path = Some(child_path);
                    } else {
                        sibling_dirs.push(child_path);
                    }
                }
                EntryKind::File => {
                    let Some((name_start, name_end)) = entry
                        .name_range
                        .map(|(start, end)| (entry_start + start, entry_start + end))
                    else {
                        continue;
                    };

                    let name = &buffer[name_start..name_end];
                    let child_path = current.path.join(Path::new(OsStr::from_bytes(name)));
                    visit(WalkEvent::File(&child_path), state);
                }
                EntryKind::Other => {}
            }
        }
    }

    share_siblings(sibling_dirs, shared);

    let next_path = next_child_path?;
    match open_directory_at(current.dir.fd, next_child_name, openat_name) {
        Ok(dir) => Some(OpenDirWork {
            path: next_path,
            dir,
        }),
        Err(error) => {
            visit(
                WalkEvent::Warning {
                    path: &next_path,
                    error: &error,
                },
                state,
            );
            None
        }
    }
}

fn share_siblings(sibling_dirs: &mut Vec<PathBuf>, shared: &Arc<(Mutex<WorkState>, Condvar)>) {
    if sibling_dirs.is_empty() {
        return;
    }

    let shared_count = sibling_dirs.len();
    let (lock, condvar) = &**shared;
    let mut state = lock.lock().unwrap();
    state.stack.append(sibling_dirs);
    if shared_count == 1 {
        condvar.notify_one();
    } else {
        condvar.notify_all();
    }
}

fn finish_work(shared: &Arc<(Mutex<WorkState>, Condvar)>, done: &Arc<AtomicBool>) {
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
