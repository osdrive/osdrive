use od_indexer::{walk_dir, WalkControl, WalkEvent};
use std::ffi::OsStr;
use std::path::Component;
use std::{path::Path, time::Instant};

#[derive(Default)]
struct Stats {
    dirs_seen: u64,
    files_seen: u64,
    warnings: u64,
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

fn main() {
    println!("Indexing...");
    let start = Instant::now();
    let stats = walk_dir(
        Path::new("/System/Volumes/Data"),
        Stats::default,
        |event, stats| match event {
            WalkEvent::Dir(path) => {
                if should_skip_directory(path) {
                    WalkControl::SkipDir
                } else {
                    stats.dirs_seen += 1;
                    WalkControl::Continue
                }
            }
            WalkEvent::File(_) => {
                stats.files_seen += 1;
                WalkControl::Continue
            }
            WalkEvent::Warning { path, error } => {
                stats.warnings += 1;
                eprintln!("warning: skipping {}: {}", path.display(), error);
                WalkControl::Continue
            }
        },
        |mut a, b| {
            a.dirs_seen += b.dirs_seen;
            a.files_seen += b.files_seen;
            a.warnings += b.warnings;
            a
        },
    );

    println!(
        "dirs={} files={} warnings={} took={:?}",
        stats.dirs_seen,
        stats.files_seen,
        stats.warnings,
        start.elapsed()
    );
}
