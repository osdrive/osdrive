use crate::error::{Error, Result};
use crate::format::{
    DiskNode, DiskPathHash, FLAG_DIR, FLAG_EXPLICIT, HEADER_LEN, Header, MAGIC, NODE_LEN,
    PATH_HASH_LEN, VERSION, push_i64, push_u16, push_u32, push_u64,
};
use crate::path::{
    components, hash_child_path, hash_name, hash_path, normalize_path,
    validate_normalized_absolute_path,
};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct DbStats {
    pub explicit_dirs: u64,
    pub explicit_files: u64,
    pub explicit_nodes: u64,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct DbSummary {
    pub node_count: usize,
    pub stats: DbStats,
}

#[derive(Clone, Debug)]
pub struct InputEntry<'a> {
    pub path: &'a [u8],
    pub is_dir: bool,
    pub size: u64,
    pub created_unix_ns: i64,
    pub modified_unix_ns: i64,
}

#[derive(Debug)]
pub struct OwnedInputEntry {
    pub path: Box<[u8]>,
    pub is_dir: bool,
    pub size: u64,
    pub created_unix_ns: i64,
    pub modified_unix_ns: i64,
}

#[derive(Clone, Debug)]
struct BuildNode {
    parent_id: u32,
    name: Vec<u8>,
    is_dir: bool,
    size: u64,
    created_unix_ns: i64,
    modified_unix_ns: i64,
    explicit: bool,
    path_hash: u64,
    child_ids: Vec<u32>,
    children_by_name_hash: HashMap<u64, Vec<u32>>,
}

pub struct DbBuilder {
    nodes: Vec<BuildNode>,
    stats: DbStats,
}

impl DbBuilder {
    pub fn new() -> Self {
        Self {
            nodes: vec![BuildNode {
                parent_id: 0,
                name: Vec::new(),
                is_dir: true,
                size: 0,
                created_unix_ns: 0,
                modified_unix_ns: 0,
                explicit: true,
                path_hash: hash_path(b"/"),
                child_ids: Vec::new(),
                children_by_name_hash: HashMap::new(),
            }],
            stats: DbStats {
                explicit_dirs: 1,
                explicit_files: 0,
                explicit_nodes: 1,
            },
        }
    }

    pub fn add_path(&mut self, path: &[u8]) -> Result<()> {
        self.add_entry(InputEntry {
            path,
            is_dir: false,
            size: 0,
            created_unix_ns: 0,
            modified_unix_ns: 0,
        })
    }

    pub fn add_path_str(&mut self, path: &str) -> Result<()> {
        self.add_path(path.as_bytes())
    }

    pub fn add_entry(&mut self, entry: InputEntry<'_>) -> Result<()> {
        let path = normalize_path(entry.path)?;
        self.insert_path(
            &path,
            entry.is_dir,
            entry.size,
            entry.created_unix_ns,
            entry.modified_unix_ns,
        )
    }

    pub fn add_owned_entry(&mut self, entry: OwnedInputEntry) -> Result<()> {
        let path = normalize_path(&entry.path)?;
        self.insert_path(
            &path,
            entry.is_dir,
            entry.size,
            entry.created_unix_ns,
            entry.modified_unix_ns,
        )
    }

    pub fn add_owned_entry_unchecked(&mut self, entry: OwnedInputEntry) -> Result<()> {
        debug_assert!(validate_normalized_absolute_path(&entry.path).is_ok());
        self.insert_path(
            &entry.path,
            entry.is_dir,
            entry.size,
            entry.created_unix_ns,
            entry.modified_unix_ns,
        )
    }

    pub fn write_to_path(self, path: impl AsRef<Path>) -> Result<()> {
        self.write_to_path_with_summary(path).map(|_| ())
    }

    pub fn write_to_path_with_stats(self, path: impl AsRef<Path>) -> Result<DbStats> {
        self.write_to_path_with_summary(path)
            .map(|summary| summary.stats)
    }

    pub fn write_to_path_with_summary(self, path: impl AsRef<Path>) -> Result<DbSummary> {
        let (bytes, summary) = self.build_bytes_with_summary()?;
        fs::write(path, bytes)?;
        Ok(summary)
    }

    pub fn build_bytes(self) -> Result<Vec<u8>> {
        self.build_bytes_with_summary().map(|(bytes, _)| bytes)
    }

    pub fn build_bytes_with_stats(self) -> Result<(Vec<u8>, DbStats)> {
        self.build_bytes_with_summary()
            .map(|(bytes, summary)| (bytes, summary.stats))
    }

    pub fn build_bytes_with_summary(mut self) -> Result<(Vec<u8>, DbSummary)> {
        self.sort_children();

        let mut names = Vec::new();
        let mut disk_nodes = Vec::with_capacity(self.nodes.len());
        let mut edges = Vec::new();
        let mut hashes = Vec::with_capacity(self.nodes.len());

        for (index, node) in self.nodes.iter().enumerate() {
            let name_offset = u32::try_from(names.len())
                .map_err(|_| Error::InvalidFormat("name blob too large"))?;
            let name_len = u16::try_from(node.name.len())
                .map_err(|_| Error::InvalidFormat("name too long"))?;
            names.extend_from_slice(&node.name);

            let first_child_edge = u32::try_from(edges.len())
                .map_err(|_| Error::InvalidFormat("too many child edges"))?;
            edges.extend_from_slice(&node.child_ids);
            let child_count = u32::try_from(node.child_ids.len())
                .map_err(|_| Error::InvalidFormat("too many children"))?;

            disk_nodes.push(DiskNode {
                parent_id: node.parent_id,
                first_child_edge,
                child_count,
                name_offset,
                name_len,
                flags: (if node.is_dir { FLAG_DIR } else { 0 })
                    | (if node.explicit { FLAG_EXPLICIT } else { 0 }),
                size: node.size,
                created_unix_ns: node.created_unix_ns,
                modified_unix_ns: node.modified_unix_ns,
            });

            hashes.push(DiskPathHash {
                hash: node.path_hash,
                node_id: index as u32,
            });
        }

        hashes.sort_unstable_by(|a, b| a.hash.cmp(&b.hash).then(a.node_id.cmp(&b.node_id)));

        let summary = DbSummary {
            node_count: self.nodes.len(),
            stats: self.stats,
        };

        Ok((
            serialize_snapshot(&disk_nodes, &edges, &names, &hashes, summary)?,
            summary,
        ))
    }

    fn insert_path(
        &mut self,
        path: &[u8],
        is_dir: bool,
        size: u64,
        created_unix_ns: i64,
        modified_unix_ns: i64,
    ) -> Result<()> {
        if path == b"/" {
            let root = &mut self.nodes[0];
            root.is_dir = true;
            root.size = size;
            root.created_unix_ns = created_unix_ns;
            root.modified_unix_ns = modified_unix_ns;
            return Ok(());
        }

        let mut current_id = 0u32;
        for component in components(path) {
            let is_terminal = component_end_offset(path, component) == path.len();
            let next_id = match self.lookup_child(current_id, component) {
                Some(id) => id,
                None => self.insert_child(current_id, component, !is_terminal || is_dir)?,
            };

            if is_terminal {
                let node = &mut self.nodes[next_id as usize];
                if !node.explicit {
                    node.explicit = true;
                    self.stats.explicit_nodes += 1;
                    if is_dir {
                        self.stats.explicit_dirs += 1;
                    } else {
                        self.stats.explicit_files += 1;
                    }
                } else if node.is_dir != is_dir {
                    if is_dir {
                        self.stats.explicit_dirs += 1;
                        self.stats.explicit_files -= 1;
                    } else {
                        self.stats.explicit_files += 1;
                        self.stats.explicit_dirs -= 1;
                    }
                }

                node.is_dir = is_dir;
                node.size = size;
                node.created_unix_ns = created_unix_ns;
                node.modified_unix_ns = modified_unix_ns;
            } else {
                self.nodes[next_id as usize].is_dir = true;
            }

            current_id = next_id;
        }

        Ok(())
    }

    fn lookup_child(&self, parent_id: u32, name: &[u8]) -> Option<u32> {
        let parent = self.nodes.get(parent_id as usize)?;
        let candidates = parent.children_by_name_hash.get(&hash_name(name))?;
        candidates
            .iter()
            .copied()
            .find(|child_id| self.nodes[*child_id as usize].name.as_slice() == name)
    }

    fn insert_child(&mut self, parent_id: u32, name: &[u8], is_dir: bool) -> Result<u32> {
        let id = u32::try_from(self.nodes.len()).map_err(|_| Error::NodeLimitExceeded)?;
        let path_hash = hash_child_path(
            self.nodes[parent_id as usize].path_hash,
            parent_id == 0,
            name,
        );
        self.nodes.push(BuildNode {
            parent_id,
            name: name.to_vec(),
            is_dir,
            size: 0,
            created_unix_ns: 0,
            modified_unix_ns: 0,
            explicit: false,
            path_hash,
            child_ids: Vec::new(),
            children_by_name_hash: HashMap::new(),
        });

        let parent = &mut self.nodes[parent_id as usize];
        parent.child_ids.push(id);
        parent
            .children_by_name_hash
            .entry(hash_name(name))
            .or_default()
            .push(id);
        Ok(id)
    }

    fn sort_children(&mut self) {
        let node_names: Vec<Vec<u8>> = self.nodes.iter().map(|node| node.name.clone()).collect();
        for node in &mut self.nodes {
            node.child_ids
                .sort_unstable_by(|a, b| node_names[*a as usize].cmp(&node_names[*b as usize]));
        }
    }
}

fn component_end_offset(path: &[u8], component: &[u8]) -> usize {
    let component_start = component.as_ptr() as usize - path.as_ptr() as usize;
    component_start + component.len()
}

impl Default for DbBuilder {
    fn default() -> Self {
        Self::new()
    }
}

fn serialize_snapshot(
    nodes: &[DiskNode],
    edges: &[u32],
    names: &[u8],
    hashes: &[DiskPathHash],
    summary: DbSummary,
) -> Result<Vec<u8>> {
    let nodes_offset = HEADER_LEN as u64;
    let nodes_len = (nodes.len() * NODE_LEN) as u64;
    let edges_offset = nodes_offset + nodes_len;
    let edges_len = (edges.len() * 4) as u64;
    let names_offset = edges_offset + edges_len;
    let names_len = names.len() as u64;
    let hashes_offset = names_offset + names_len;

    let header = Header {
        root_id: 0,
        node_count: u32::try_from(nodes.len()).map_err(|_| Error::NodeLimitExceeded)?,
        edge_count: u32::try_from(edges.len())
            .map_err(|_| Error::InvalidFormat("too many edges"))?,
        nodes_offset,
        edges_offset,
        names_offset,
        names_len,
        hashes_offset,
        hash_count: u32::try_from(hashes.len())
            .map_err(|_| Error::InvalidFormat("too many hashes"))?,
        explicit_dirs: summary.stats.explicit_dirs,
        explicit_files: summary.stats.explicit_files,
        explicit_nodes: summary.stats.explicit_nodes,
    };

    let mut buffer =
        Vec::with_capacity((hashes_offset + (hashes.len() * PATH_HASH_LEN) as u64) as usize);
    buffer.extend_from_slice(&MAGIC);
    push_u32(&mut buffer, VERSION);
    push_u32(&mut buffer, header.root_id);
    push_u32(&mut buffer, header.node_count);
    push_u32(&mut buffer, header.edge_count);
    push_u64(&mut buffer, header.nodes_offset);
    push_u64(&mut buffer, header.edges_offset);
    push_u64(&mut buffer, header.names_offset);
    push_u64(&mut buffer, header.names_len);
    push_u64(&mut buffer, header.hashes_offset);
    push_u32(&mut buffer, header.hash_count);
    push_u64(&mut buffer, header.explicit_dirs);
    push_u64(&mut buffer, header.explicit_files);
    push_u64(&mut buffer, header.explicit_nodes);
    while buffer.len() < HEADER_LEN {
        buffer.push(0);
    }

    for node in nodes {
        push_u32(&mut buffer, node.parent_id);
        push_u32(&mut buffer, node.first_child_edge);
        push_u32(&mut buffer, node.child_count);
        push_u32(&mut buffer, node.name_offset);
        push_u16(&mut buffer, node.name_len);
        push_u16(&mut buffer, node.flags);
        push_u64(&mut buffer, node.size);
        push_i64(&mut buffer, node.created_unix_ns);
        push_i64(&mut buffer, node.modified_unix_ns);
    }

    for edge in edges {
        push_u32(&mut buffer, *edge);
    }

    buffer.extend_from_slice(names);

    for hash in hashes {
        push_u64(&mut buffer, hash.hash);
        push_u32(&mut buffer, hash.node_id);
    }

    Ok(buffer)
}
