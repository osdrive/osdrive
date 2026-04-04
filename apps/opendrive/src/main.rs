use od_indexer::{walk_dir, WalkControl, WalkEvent};
use std::ffi::OsStr;
use std::os::unix::ffi::OsStrExt;
use std::path::Component;
use std::sync::{Arc, Mutex};
use std::{io, path::Path, time::Instant};
use walrus_rust::{FsyncSchedule, ReadConsistency, Walrus};

const ROOT_PATH: &str = "/System/Volumes/Data";
const WAL_KEY: &str = "opendrive-paths";
const WAL_TOPIC: &str = "paths";
const MAX_PENDING_PATHS: usize = 2_000;
const MAX_PENDING_BYTES: usize = 1024 * 1024;

struct Stats {
    dirs_seen: u64,
    files_seen: u64,
    warnings: u64,
    persisted_paths: u64,
    wal: Arc<Mutex<Walrus>>,
    pending_paths: Vec<Vec<u8>>,
    pending_bytes: usize,
    first_error: Option<String>,
}

impl Stats {
    fn new(wal: Arc<Mutex<Walrus>>) -> Self {
        Self {
            dirs_seen: 0,
            files_seen: 0,
            warnings: 0,
            persisted_paths: 0,
            wal,
            pending_paths: Vec::with_capacity(MAX_PENDING_PATHS),
            pending_bytes: 0,
            first_error: None,
        }
    }

    fn record_path(&mut self, path: &Path) {
        if self.first_error.is_some() {
            return;
        }

        let bytes = path.as_os_str().as_bytes();
        self.pending_bytes += bytes.len();
        self.pending_paths.push(bytes.to_vec());

        if self.pending_paths.len() >= MAX_PENDING_PATHS || self.pending_bytes >= MAX_PENDING_BYTES
        {
            self.flush_pending();
        }
    }

    fn flush_pending(&mut self) {
        if self.first_error.is_some() || self.pending_paths.is_empty() {
            return;
        }

        let batch: Vec<&[u8]> = self.pending_paths.iter().map(Vec::as_slice).collect();
        let wal = match self.wal.lock() {
            Ok(wal) => wal,
            Err(error) => {
                self.first_error = Some(format!("failed to lock walrus writer: {error}"));
                self.pending_paths.clear();
                self.pending_bytes = 0;
                return;
            }
        };

        match wal.batch_append_for_topic(WAL_TOPIC, &batch) {
            Ok(()) => {
                self.persisted_paths += self.pending_paths.len() as u64;
            }
            Err(error) => {
                self.first_error = Some(format!("failed to persist path batch: {error}"));
            }
        }

        self.pending_paths.clear();
        self.pending_bytes = 0;
    }

    fn finish(&mut self) -> io::Result<()> {
        self.flush_pending();

        if let Some(error) = self.first_error.take() {
            return Err(io::Error::other(error));
        }

        Ok(())
    }
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

fn main() -> io::Result<()> {
    println!("Indexing...");
    let start = Instant::now();

    let wal = Arc::new(Mutex::new(Walrus::with_consistency_and_schedule_for_key(
        WAL_KEY,
        ReadConsistency::StrictlyAtOnce,
        FsyncSchedule::NoFsync,
    )?));

    let stats = walk_dir(
        Path::new(ROOT_PATH),
        {
            let wal = Arc::clone(&wal);
            move || Stats::new(Arc::clone(&wal))
        },
        |event, stats| match event {
            WalkEvent::Dir(path) => {
                if should_skip_directory(path) {
                    WalkControl::SkipDir
                } else {
                    stats.dirs_seen += 1;
                    stats.record_path(path);
                    WalkControl::Continue
                }
            }
            WalkEvent::File(path) => {
                stats.files_seen += 1;
                stats.record_path(path);
                WalkControl::Continue
            }
            WalkEvent::Warning { path, error } => {
                stats.warnings += 1;
                eprintln!("warning: skipping {}: {}", path.display(), error);
                WalkControl::Continue
            }
        },
        |mut a, mut b| {
            a.flush_pending();
            b.flush_pending();
            a.dirs_seen += b.dirs_seen;
            a.files_seen += b.files_seen;
            a.warnings += b.warnings;
            a.persisted_paths += b.persisted_paths;
            if a.first_error.is_none() {
                a.first_error = b.first_error.take();
            }
            a
        },
    );

    let mut stats = stats;
    stats.finish()?;

    println!(
        "dirs={} files={} warnings={} persisted={} took={:?}",
        stats.dirs_seen,
        stats.files_seen,
        stats.warnings,
        stats.persisted_paths,
        start.elapsed()
    );

    Ok(())
}
