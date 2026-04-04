use od_db::{Db, DbBuilder, InputEntry};
use od_indexer::{walk_dir, WalkControl, WalkEvent};
use std::ffi::OsStr;
use std::os::unix::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use std::time::{Instant, UNIX_EPOCH};

#[derive(Default)]
struct Stats {
    entries: u64,
    builder: DbBuilder,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = std::env::args_os().skip(1);
    let root = args
        .next()
        .ok_or("usage: cargo run -p od-db --example ingest_paths -- <root> <output>")?;
    let output = args
        .next()
        .ok_or("usage: cargo run -p od-db --example ingest_paths -- <root> <output>")?;
    let root = absolutize(Path::new(&root))?;
    let output = Path::new(&output);

    let start = Instant::now();
    let stats = walk_dir(
        &root,
        Stats::default,
        |event, stats| match event {
            WalkEvent::Dir(path) => {
                if should_skip_directory(path) {
                    WalkControl::SkipDir
                } else {
                    if let Err(error) = record_path(stats, path, true) {
                        eprintln!("warning: failed to record {}: {error}", path.display());
                    }
                    WalkControl::Continue
                }
            }
            WalkEvent::File(path) => {
                if let Err(error) = record_path(stats, path, false) {
                    eprintln!("warning: failed to record {}: {error}", path.display());
                }
                WalkControl::Continue
            }
            WalkEvent::Warning { path, error } => {
                eprintln!("warning: skipping {}: {error}", path.display());
                WalkControl::Continue
            }
        },
        |mut a, b| {
            a.entries += b.entries;
            a.builder.extend(b.builder);
            a
        },
    );

    stats.builder.write_to_path(output)?;
    let db = Db::open(output)?;
    println!(
        "indexed={} nodes={} root_children={} took={:?}",
        stats.entries,
        db.node_count(),
        db.children(db.root_id())?.len(),
        start.elapsed()
    );

    Ok(())
}

fn record_path(
    stats: &mut Stats,
    path: &Path,
    is_dir: bool,
) -> Result<(), Box<dyn std::error::Error>> {
    let metadata = path.metadata()?;
    let created = metadata.created().ok().and_then(to_unix_ns).unwrap_or(0);
    let modified = metadata.modified().ok().and_then(to_unix_ns).unwrap_or(0);
    stats.builder.add_entry(InputEntry {
        path: path.as_os_str().as_bytes(),
        is_dir,
        size: metadata.len(),
        created_unix_ns: created,
        modified_unix_ns: modified,
    })?;
    stats.entries += 1;
    Ok(())
}

fn to_unix_ns(time: std::time::SystemTime) -> Option<i64> {
    let duration = time.duration_since(UNIX_EPOCH).ok()?;
    i64::try_from(duration.as_nanos()).ok()
}

fn should_skip_directory(path: &Path) -> bool {
    matches!(path.file_name(), Some(name) if name == OsStr::new("target") || name == OsStr::new("node_modules"))
}

fn absolutize(path: &Path) -> Result<PathBuf, Box<dyn std::error::Error>> {
    if path.is_absolute() {
        return Ok(path.to_path_buf());
    }

    Ok(std::env::current_dir()?.join(path))
}
