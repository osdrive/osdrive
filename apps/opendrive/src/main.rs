use od_db::{Db, DbBuilder, InputEntry};
use od_indexer::{walk_dir, WalkControl, WalkEvent};
use std::ffi::OsStr;
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::path::Component;
use std::path::Path;
use std::time::Instant;

const ROOT_PATH: &str = "/System/Volumes/Data";
const OUTPUT_PATH: &str = "./fs.odb";

struct BuildState {
    builder: DbBuilder,
    first_error: Option<String>,
}

impl BuildState {
    fn new() -> Self {
        Self {
            builder: DbBuilder::new(),
            first_error: None,
        }
    }

    fn record_path(&mut self, path: &Path, is_dir: bool) {
        if self.first_error.is_some() {
            return;
        }

        if let Err(error) = self.builder.add_entry(InputEntry {
            path: path.as_os_str().as_bytes(),
            is_dir,
            size: 0,
            created_unix_ns: 0,
            modified_unix_ns: 0,
        }) {
            self.first_error = Some(format!("failed to record {}: {error}", path.display()));
        }
    }

    fn finish(self) -> io::Result<DbBuilder> {
        match self.first_error {
            Some(error) => Err(io::Error::other(error)),
            None => Ok(self.builder),
        }
    }
}

#[derive(Default)]
struct SnapshotStats {
    dirs: u64,
    files: u64,
    persisted: u64,
}

fn user_relative_components<'a>(parts: &'a [&'a OsStr]) -> Option<&'a [&'a OsStr]> {
    if let [system, volumes, data, users, _, rest @ ..] = parts {
        if *system == OsStr::new("System")
            && *volumes == OsStr::new("Volumes")
            && *data == OsStr::new("Data")
            && *users == OsStr::new("Users")
        {
            return Some(rest);
        }
    }

    if let [users, _, rest @ ..] = parts {
        if *users == OsStr::new("Users") {
            return Some(rest);
        }
    }

    None
}

fn is_system_data_library_caches(parts: &[&OsStr]) -> bool {
    matches!(
        parts,
        [system, volumes, data, library, caches, ..]
            if *system == OsStr::new("System")
                && *volumes == OsStr::new("Volumes")
                && *data == OsStr::new("Data")
                && *library == OsStr::new("Library")
                && *caches == OsStr::new("Caches")
    )
}

fn is_temp_cache_root(parts: &[&OsStr]) -> bool {
    matches!(parts, [tmp, ..] if *tmp == OsStr::new("tmp"))
        || matches!(parts, [var, tmp, ..] if *var == OsStr::new("var") && *tmp == OsStr::new("tmp"))
        || matches!(parts, [private, tmp, ..] if *private == OsStr::new("private") && *tmp == OsStr::new("tmp"))
        || matches!(parts, [private, var, tmp, ..]
            if *private == OsStr::new("private")
                && *var == OsStr::new("var")
                && *tmp == OsStr::new("tmp"))
}

fn should_skip_directory(path: &Path) -> bool {
    let Some(name) = path.file_name() else {
        return false;
    };

    if name == OsStr::new("target") || name == OsStr::new("node_modules") {
        return true;
    }

    let parts: Vec<_> = path
        .components()
        .filter_map(|component| match component {
            Component::Normal(part) => Some(part),
            _ => None,
        })
        .collect();

    if is_system_data_library_caches(&parts) || is_temp_cache_root(&parts) {
        return true;
    }

    if let Some(user_relative) = user_relative_components(&parts) {
        if matches!(user_relative, [library, caches, ..]
            if *library == OsStr::new("Library") && *caches == OsStr::new("Caches"))
        {
            return true;
        }

        if matches!(user_relative, [cache, ..] if *cache == OsStr::new(".cargo"))
            || matches!(user_relative, [cache, ..] if *cache == OsStr::new(".rustup"))
            || matches!(user_relative, [cache, ..] if *cache == OsStr::new(".pnpm-store"))
            || matches!(user_relative, [dot_cache, tool, ..]
                if *dot_cache == OsStr::new(".cache")
                    && (*tool == OsStr::new("pnpm") || *tool == OsStr::new("zig")))
            || matches!(user_relative, [library, pnpm, ..]
                if *library == OsStr::new("Library") && *pnpm == OsStr::new("pnpm"))
        {
            return true;
        }
    }

    false
}

fn reconstruct_stats(db: &Db) -> io::Result<SnapshotStats> {
    let mut stats = SnapshotStats::default();

    for id in 0..db.node_count() {
        let node = db
            .get(id as u32)
            .ok_or_else(|| io::Error::other(format!("missing node {id}")))?;
        if !node.is_explicit {
            continue;
        }

        stats.persisted += 1;
        if node.is_dir {
            stats.dirs += 1;
        } else {
            stats.files += 1;
        }
    }

    Ok(stats)
}

fn main() -> io::Result<()> {
    println!("Indexing...");
    let index_start = Instant::now();

    let state = walk_dir(
        Path::new(ROOT_PATH),
        BuildState::new,
        |event, state| match event {
            WalkEvent::Dir(path) => {
                if should_skip_directory(path) {
                    WalkControl::SkipDir
                } else {
                    state.record_path(path, true);
                    WalkControl::Continue
                }
            }
            WalkEvent::File(path) => {
                state.record_path(path, false);
                WalkControl::Continue
            }
            WalkEvent::Warning { path, error } => {
                eprintln!("warning: skipping {}: {}", path.display(), error);
                WalkControl::Continue
            }
        },
        |mut a, mut b| {
            a.builder.extend(b.builder);
            if a.first_error.is_none() {
                a.first_error = b.first_error.take();
            }
            a
        },
    );

    state
        .finish()?
        .write_to_path(OUTPUT_PATH)
        .map_err(io::Error::other)?;
    let index_took = index_start.elapsed();

    let stats_start = Instant::now();
    let db = Db::open(OUTPUT_PATH).map_err(io::Error::other)?;
    let stats = reconstruct_stats(&db)?;
    let stats_took = stats_start.elapsed();

    println!(
        "dirs={} files={} persisted={} nodes={} index_took={:?} stats_took={:?}",
        stats.dirs,
        stats.files,
        stats.persisted,
        db.node_count(),
        index_took,
        stats_took,
    );

    Ok(())
}
