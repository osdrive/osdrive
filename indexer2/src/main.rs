use std::ffi::CString;
use std::ffi::OsStr;
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::io::RawFd;
use std::path::{Path, PathBuf};
use std::time::Instant;

const ROOT: &str = "/System/Volumes/Data";
const BULK_BUFFER_SIZE: usize = 256 * 1024;

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
struct AttributeSet {
    commonattr: u32,
    volattr: u32,
    dirattr: u32,
    fileattr: u32,
    forkattr: u32,
}

#[repr(C)]
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
    let mut stack = vec![root.to_path_buf()];
    let mut buffer = vec![0; BULK_BUFFER_SIZE];

    while let Some(dir) = stack.pop() {
        if should_skip_dir(&dir) {
            continue;
        }

        stats.dirs_seen += 1;

        let dirfd = match open_directory(&dir) {
            Ok(dirfd) => dirfd,
            Err(error) => {
                warn_and_skip(&mut stats, &dir, &error);
                continue;
            }
        };

        'dir: loop {
            let entry_count = match refill_buffer(dirfd, &mut buffer) {
                Ok(0) => break,
                Ok(entry_count) => entry_count,
                Err(BulkReadError::Io(error)) => {
                    warn_and_skip(&mut stats, &dir, &error);
                    break;
                }
                Err(BulkReadError::Parse(error)) => {
                    stats.warnings += 1;
                    eprintln!("warning: skipping {}: {}", dir.display(), error);
                    break;
                }
            };

            let mut offset = 0usize;

            for _ in 0..entry_count {
                let (entry, entry_end) = match parse_bulk_entry(&buffer, offset) {
                    Ok(parsed) => parsed,
                    Err(BulkReadError::Parse(error)) => {
                        stats.warnings += 1;
                        eprintln!(
                            "warning: skipping remainder of {} after bulk parse failure: {}",
                            dir.display(),
                            error
                        );
                        break 'dir;
                    }
                    Err(BulkReadError::Io(error)) => {
                        warn_and_skip(&mut stats, &dir, &error);
                        break 'dir;
                    }
                };

                offset = entry_end;

                match entry.kind {
                    EntryKind::Directory => {
                        if let Some((name_start, name_end)) = entry.name_range {
                            let path = dir.join(OsStr::from_bytes(&buffer[name_start..name_end]));
                            if !should_skip_dir(&path) {
                                stack.push(path);
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

        unsafe {
            libc::close(dirfd);
        }
    }

    stats
}

fn parse_bulk_entry(
    buffer: &[u8],
    start_offset: usize,
) -> Result<(ParsedEntry, usize), BulkReadError> {
    let entry_length = read_u32(buffer, start_offset)
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

    if entry.len() < 4 + std::mem::size_of::<AttributeSet>() {
        return Err(BulkReadError::Parse("entry too short"));
    }

    let returned_offset = 4;
    let returned = AttributeSet {
        commonattr: read_u32(entry, returned_offset)
            .ok_or(BulkReadError::Parse("missing commonattr"))?,
        volattr: read_u32(entry, returned_offset + 4)
            .ok_or(BulkReadError::Parse("missing volattr"))?,
        dirattr: read_u32(entry, returned_offset + 8)
            .ok_or(BulkReadError::Parse("missing dirattr"))?,
        fileattr: read_u32(entry, returned_offset + 12)
            .ok_or(BulkReadError::Parse("missing fileattr"))?,
        forkattr: read_u32(entry, returned_offset + 16)
            .ok_or(BulkReadError::Parse("missing forkattr"))?,
    };

    let mut offset = 4 + std::mem::size_of::<AttributeSet>();

    let name_range = if returned.commonattr & ATTR_CMN_NAME != 0 {
        let attr_reference = read_attr_reference(entry, offset)?;
        offset += std::mem::size_of::<AttrReference>();
        Some(parse_name_range(
            entry,
            offset - std::mem::size_of::<AttrReference>(),
            attr_reference,
        )?)
    } else {
        None
    };

    let kind = if returned.commonattr & ATTR_CMN_OBJTYPE != 0 {
        match read_u32(entry, offset).ok_or(BulkReadError::Parse("missing object type"))? {
            VDIR => EntryKind::Directory,
            VREG => EntryKind::File,
            _ => EntryKind::Other,
        }
    } else {
        EntryKind::Other
    };

    let absolute_name_range = match kind {
        EntryKind::Directory => {
            name_range.map(|(start, end)| (start + start_offset, end + start_offset))
        }
        _ => None,
    };

    Ok((
        ParsedEntry {
            kind,
            name_range: absolute_name_range,
        },
        entry_end,
    ))
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
