use std::ffi::CString;
use std::ffi::OsStr;
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::io::RawFd;
use std::path::{Path, PathBuf};
use std::time::Instant;

const ROOT: &str = "/System/Volumes/Data";
const BULK_BUFFER_SIZE: usize = 1024 * 1024;

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
    name_reference_offset: Option<usize>,
    name_reference: Option<AttrReference>,
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

fn open_directory_at(parent_fd: RawFd, name: &OsStr) -> Result<RawFd, io::Error> {
    let c_name = CString::new(name.as_bytes())
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "path contains null byte"))?;

    let dirfd = unsafe {
        libc::openat(
            parent_fd,
            c_name.as_ptr(),
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
    path: PathBuf,
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

fn should_skip_dir(path: &Path) -> bool {
    path == Path::new("/dev")
        || path == Path::new("/Volumes")
        || path == Path::new("/System/Volumes")
}

fn warn_and_skip(stats: &mut WalkStats, path: &Path, error: &impl std::fmt::Display) {
    stats.warnings += 1;
    eprintln!("warning: skipping {}: {}", path.display(), error);
}

fn walk_dir(root: &Path) -> WalkStats {
    let mut stats = WalkStats::default();
    let mut buffer = vec![0; BULK_BUFFER_SIZE];
    let mut stack = Vec::new();

    match open_directory(root) {
        Ok(fd) => stack.push(DirFrame {
            fd,
            path: root.to_path_buf(),
        }),
        Err(error) => {
            warn_and_skip(&mut stats, root, &error);
            return stats;
        }
    }

    while let Some(dir) = stack.pop() {
        if should_skip_dir(&dir.path) {
            continue;
        }

        stats.dirs_seen += 1;

        'dir: loop {
            let entry_count = match refill_buffer(dir.fd, &mut buffer) {
                Ok(0) => break,
                Ok(entry_count) => entry_count,
                Err(BulkReadError::Io(error)) => {
                    warn_and_skip(&mut stats, &dir.path, &error);
                    break;
                }
                Err(BulkReadError::Parse(error)) => {
                    stats.warnings += 1;
                    eprintln!("warning: skipping {}: {}", dir.path.display(), error);
                    break;
                }
            };

            let mut offset = 0usize;

            for _ in 0..entry_count {
                let entry_start = offset;
                let (entry, entry_end) = match parse_bulk_entry(&buffer, entry_start) {
                    Ok(parsed) => parsed,
                    Err(BulkReadError::Parse(error)) => {
                        stats.warnings += 1;
                        eprintln!(
                            "warning: skipping remainder of {} after bulk parse failure: {}",
                            dir.path.display(),
                            error
                        );
                        break 'dir;
                    }
                    Err(BulkReadError::Io(error)) => {
                        warn_and_skip(&mut stats, &dir.path, &error);
                        break 'dir;
                    }
                };

                offset = entry_end;

                match entry.kind {
                    EntryKind::Directory => {
                        let Some((name_start, name_end)) = entry.name_range(&buffer, entry_start)
                        else {
                            stats.warnings += 1;
                            eprintln!(
                                "warning: skipping {}: missing directory name",
                                dir.path.display()
                            );
                            continue;
                        };

                        let name = OsStr::from_bytes(&buffer[name_start..name_end]);
                        let child_fd = match open_directory_at(dir.fd, name) {
                            Ok(fd) => fd,
                            Err(error) => {
                                let path = dir.path.join(name);
                                warn_and_skip(&mut stats, &path, &error);
                                continue;
                            }
                        };

                        let path = dir.path.join(name);
                        if !should_skip_dir(&path) {
                            stack.push(DirFrame { fd: child_fd, path });
                        } else {
                            unsafe {
                                libc::close(child_fd);
                            }
                        }
                    }
                    EntryKind::File => {
                        stats.files_seen += 1;
                    }
                    EntryKind::Other => {}
                }
            }
        }
    }

    stats
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

    let (name_reference_offset, name_reference) = if returned_commonattr & ATTR_CMN_NAME != 0 {
        let reference_offset = offset;
        let attr_reference = read_attr_reference(entry, reference_offset)?;
        offset += NAME_REFERENCE_SIZE;
        (Some(reference_offset), Some(attr_reference))
    } else {
        (None, None)
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

    Ok((
        ParsedEntry {
            kind,
            name_reference_offset,
            name_reference,
        },
        entry_end,
    ))
}

impl ParsedEntry {
    fn name_range(&self, buffer: &[u8], entry_start: usize) -> Option<(usize, usize)> {
        let reference_offset = self.name_reference_offset?;
        let reference = self.name_reference?;
        let entry = buffer.get(entry_start..)?;
        let (name_start, name_end) = parse_name_range(entry, reference_offset, reference).ok()?;
        Some((entry_start + name_start, entry_start + name_end))
    }
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
    let bytes: [u8; 4] = buffer.get(offset..offset + 4)?.try_into().ok()?;
    Some(u32::from_ne_bytes(bytes))
}

fn read_i32(buffer: &[u8], offset: usize) -> Option<i32> {
    let bytes: [u8; 4] = buffer.get(offset..offset + 4)?.try_into().ok()?;
    Some(i32::from_ne_bytes(bytes))
}

fn main() {
    let start = Instant::now();
    let stats = walk_dir(&PathBuf::from(ROOT));

    println!(
        "dirs={} files={} warnings={} took={:?}",
        stats.dirs_seen,
        stats.files_seen,
        stats.warnings,
        start.elapsed()
    );
}
