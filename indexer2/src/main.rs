use std::collections::HashSet;
use std::fs;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};
use std::time::Instant;

fn should_skip_dir(path: &Path) -> bool {
    path == Path::new("/dev") ||
    // TODO: We should automatically alias these instead of following the index?
    // TODO: Can we basically detect where a symlink points and then skip indexing but just leave a link
    path == Path::new("/System/Volumes/")
}

fn warn_if_permission_denied(error: &std::io::Error, path: &Path) -> bool {
    if error.kind() == ErrorKind::PermissionDenied {
        eprintln!("warning: skipping {}: {}", path.display(), error);
        true
    } else {
        false
    }
}

fn walk_dir(root: &Path) -> std::io::Result<()> {
    let mut stack = vec![root.to_path_buf()];
    let mut visited_dirs = HashSet::new();

    while let Some(dir) = stack.pop() {
        if should_skip_dir(&dir) {
            continue;
        }

        let canonical_dir = match fs::canonicalize(&dir) {
            Ok(path) => path,
            Err(error) if warn_if_permission_denied(&error, &dir) => continue,
            Err(error) => return Err(error),
        };

        // Track visited directories so we do not recurse forever if symlinked
        // directories or aliases are introduced later.
        if !visited_dirs.insert(canonical_dir) {
            continue;
        }

        // println!("dir {}", dir.display());

        let entries = match fs::read_dir(&dir) {
            Ok(entries) => entries,
            Err(error) if warn_if_permission_denied(&error, &dir) => continue,
            Err(error) => return Err(error),
        };

        for entry in entries {
            let entry = match entry {
                Ok(entry) => entry,
                Err(error) if warn_if_permission_denied(&error, &dir) => continue,
                Err(error) => return Err(error),
            };

            let path = entry.path();
            let file_type = match entry.file_type() {
                Ok(file_type) => file_type,
                Err(error) if warn_if_permission_denied(&error, &path) => continue,
                Err(error) => return Err(error),
            };

            if file_type.is_dir() {
                if !should_skip_dir(&path) {
                    stack.push(path);
                }
            } else if file_type.is_file() {
                // println!("file {}", path.display());
            }
        }
    }

    Ok(())
}

fn main() -> std::io::Result<()> {
    let start = Instant::now();
    walk_dir(&PathBuf::from("/"))?;
    println!("Took: {:?}", Instant::now() - start);
    Ok(())
}
