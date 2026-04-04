use crate::error::{Error, Result};

pub fn normalize_path(path: &[u8]) -> Result<Vec<u8>> {
    if path.is_empty() {
        return Err(Error::InvalidPath("path is empty"));
    }

    if path[0] != b'/' {
        return Err(Error::InvalidPath("path must be absolute"));
    }

    let mut normalized = Vec::with_capacity(path.len());
    normalized.push(b'/');

    let mut index = 1;
    while index < path.len() {
        while index < path.len() && path[index] == b'/' {
            index += 1;
        }

        if index >= path.len() {
            break;
        }

        let start = index;
        while index < path.len() && path[index] != b'/' {
            index += 1;
        }

        let component = &path[start..index];
        if component == b"." {
            continue;
        }
        if component == b".." {
            return Err(Error::InvalidPath("parent traversal is not supported"));
        }
        if component.contains(&0) {
            return Err(Error::InvalidPath("path contains null byte"));
        }

        if normalized.len() > 1 {
            normalized.push(b'/');
        }
        normalized.extend_from_slice(component);
    }

    Ok(normalized)
}

pub fn components(path: &[u8]) -> impl Iterator<Item = &[u8]> {
    path.split(|byte| *byte == b'/')
        .filter(|component| !component.is_empty())
}

pub fn hash_path(path: &[u8]) -> u64 {
    const OFFSET: u64 = 0xcbf2_9ce4_8422_2325;

    extend_hash(OFFSET, path)
}

pub fn hash_child_path(parent_hash: u64, parent_is_root: bool, name: &[u8]) -> u64 {
    let hash = if parent_is_root {
        parent_hash
    } else {
        extend_hash(parent_hash, b"/")
    };
    extend_hash(hash, name)
}

fn extend_hash(mut hash: u64, bytes: &[u8]) -> u64 {
    const PRIME: u64 = 0x0000_0100_0000_01b3;

    for byte in bytes {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(PRIME);
    }

    hash
}
