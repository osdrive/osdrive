use od_indexer::{WalkFilters, walk_dir};
use std::{path::Path, time::Instant};

fn main() {
    println!("Indexing...");
    let start = Instant::now();
    let stats = walk_dir(
        Path::new("/System/Volumes/Data"),
        WalkFilters {
            skip_dev_tools: true,
            skip_cache_dirs: true,
        },
    );

    println!(
        "dirs={} files={} warnings={} throttles={} took={:?}",
        stats.dirs_seen,
        stats.files_seen,
        stats.warnings,
        stats.throttles,
        start.elapsed()
    );
}
