use od_db::{Db, DbBuilder, OwnedInputEntry};
use od_indexer::{walk_dir, WalkControl, WalkEvent};
use std::ffi::OsStr;
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::path::Path;
use std::sync::mpsc::{sync_channel, SyncSender};
use std::thread;
use std::time::Instant;

const ROOT_PATH: &str = "/System/Volumes/Data";
const OUTPUT_PATH: &str = "./fs.odb";
const CHANNEL_CAPACITY: usize = 16_384;

struct BuildState {
    sender: SyncSender<OwnedInputEntry>,
    first_error: Option<String>,
}

impl BuildState {
    fn new(sender: SyncSender<OwnedInputEntry>) -> Self {
        Self {
            sender,
            first_error: None,
        }
    }

    fn record_path(&mut self, path: &Path, is_dir: bool) {
        if self.first_error.is_some() {
            return;
        }

        let entry = OwnedInputEntry {
            path: path.as_os_str().as_bytes().to_vec().into_boxed_slice(),
            is_dir,
            size: 0,
            created_unix_ns: 0,
            modified_unix_ns: 0,
        };

        if let Err(error) = self.sender.send(entry) {
            self.first_error = Some(format!("failed to queue {}: {error}", path.display()));
        }
    }

    fn finish(self) -> io::Result<()> {
        match self.first_error {
            Some(error) => Err(io::Error::other(error)),
            None => Ok(()),
        }
    }
}

fn main() -> io::Result<()> {
    println!("Indexing...");
    let index_start = Instant::now();
    let (sender, receiver) = sync_channel(CHANNEL_CAPACITY);

    let builder_thread = thread::spawn(move || -> Result<(), od_db::Error> {
        let mut builder = DbBuilder::new();
        while let Ok(entry) = receiver.recv() {
            builder.add_owned_entry_unchecked(entry)?;
        }
        builder.write_to_path(OUTPUT_PATH)
    });

    let state = walk_dir(
        Path::new(ROOT_PATH),
        {
            let sender = sender.clone();
            move || BuildState::new(sender.clone())
        },
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
            if a.first_error.is_none() {
                a.first_error = b.first_error.take();
            }
            a
        },
    );

    drop(sender);
    let walk_result = state.finish();
    let build_result = builder_thread
        .join()
        .map_err(|_| io::Error::other("builder thread panicked"))?;

    walk_result?;
    build_result.map_err(io::Error::other)?;
    let index_took = index_start.elapsed();

    let stats_start = Instant::now();
    let summary = Db::read_summary(OUTPUT_PATH).map_err(io::Error::other)?;
    let stats_took = stats_start.elapsed();

    println!(
        "dirs={} files={} persisted={} nodes={} index_took={:?} stats_took={:?}",
        summary.stats.explicit_dirs,
        summary.stats.explicit_files,
        summary.stats.explicit_nodes,
        summary.node_count,
        index_took,
        stats_took,
    );

    Ok(())
}

fn should_skip_directory(path: &Path) -> bool {
    let Some(name) = path.file_name() else {
        return false;
    };

    if name == OsStr::new("target") || name == OsStr::new("node_modules") {
        return true;
    }

    let bytes = path.as_os_str().as_bytes();
    if has_path_prefix(bytes, b"/System/Volumes/Data/Library/Caches")
        || has_path_prefix(bytes, b"/tmp")
        || has_path_prefix(bytes, b"/var/tmp")
        || has_path_prefix(bytes, b"/private/tmp")
        || has_path_prefix(bytes, b"/private/var/tmp")
    {
        return true;
    }

    let Some(user_tail) = user_relative_tail(bytes) else {
        return false;
    };

    has_path_prefix(user_tail, b"Library/Caches")
        || has_path_prefix(user_tail, b".cargo")
        || has_path_prefix(user_tail, b".rustup")
        || has_path_prefix(user_tail, b".pnpm-store")
        || has_path_prefix(user_tail, b".cache/pnpm")
        || has_path_prefix(user_tail, b".cache/zig")
        || has_path_prefix(user_tail, b"Library/pnpm")
}

fn has_path_prefix(path: &[u8], prefix: &[u8]) -> bool {
    path == prefix
        || path
            .strip_prefix(prefix)
            .is_some_and(|rest| rest.starts_with(b"/"))
}

fn user_relative_tail(path: &[u8]) -> Option<&[u8]> {
    for prefix in [b"/System/Volumes/Data/Users/".as_slice(), b"/Users/"] {
        let Some(rest) = path.strip_prefix(prefix) else {
            continue;
        };
        let user_len = rest.iter().position(|byte| *byte == b'/')?;
        return Some(&rest[user_len + 1..]);
    }

    None
}
