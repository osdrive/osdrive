use crate::error::{Error, Result};
use crate::format::{
    push_i64, push_u16, push_u32, push_u64, DiskNode, DiskPathHash, Header, FLAG_DIR,
    FLAG_EXPLICIT, HEADER_LEN, MAGIC, NODE_LEN, PATH_HASH_LEN, VERSION,
};
use crate::path::{components, hash_child_path, hash_path, normalize_path};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

#[derive(Clone, Debug)]
pub struct InputEntry<'a> {
    pub path: &'a [u8],
    pub is_dir: bool,
    pub size: u64,
    pub created_unix_ns: i64,
    pub modified_unix_ns: i64,
}

#[derive(Clone, Debug)]
struct OwnedEntry {
    path: Vec<u8>,
    is_dir: bool,
    size: u64,
    created_unix_ns: i64,
    modified_unix_ns: i64,
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
    children: Vec<u32>,
}

#[derive(Clone, Debug, Eq, Hash, PartialEq)]
struct NodeKey {
    parent_id: u32,
    name: Vec<u8>,
}

pub struct DbBuilder {
    entries: Vec<OwnedEntry>,
}

impl DbBuilder {
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
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
        self.entries.push(OwnedEntry {
            path,
            is_dir: entry.is_dir,
            size: entry.size,
            created_unix_ns: entry.created_unix_ns,
            modified_unix_ns: entry.modified_unix_ns,
        });
        Ok(())
    }

    pub fn write_to_path(self, path: impl AsRef<Path>) -> Result<()> {
        let bytes = self.build_bytes()?;
        fs::write(path, bytes)?;
        Ok(())
    }

    pub fn extend(&mut self, mut other: Self) {
        self.entries.append(&mut other.entries);
    }

    pub fn build_bytes(mut self) -> Result<Vec<u8>> {
        self.entries.sort_by(|a, b| a.path.cmp(&b.path));

        let mut nodes = vec![BuildNode {
            parent_id: 0,
            name: Vec::new(),
            is_dir: true,
            size: 0,
            created_unix_ns: 0,
            modified_unix_ns: 0,
            explicit: true,
            path_hash: hash_path(b"/"),
            children: Vec::new(),
        }];
        let mut ids_by_key = HashMap::<NodeKey, u32>::new();

        for entry in self.entries {
            if entry.path == b"/" {
                nodes[0].size = entry.size;
                nodes[0].created_unix_ns = entry.created_unix_ns;
                nodes[0].modified_unix_ns = entry.modified_unix_ns;
                nodes[0].explicit = true;
                continue;
            }

            let mut current_id = 0u32;

            for component in components(&entry.path) {
                let is_terminal = component_end_offset(&entry.path, component) == entry.path.len();
                let key = NodeKey {
                    parent_id: current_id,
                    name: component.to_vec(),
                };
                let next_id = if let Some(id) = ids_by_key.get(&key).copied() {
                    id
                } else {
                    let id = u32::try_from(nodes.len()).map_err(|_| Error::NodeLimitExceeded)?;
                    let parent_hash = nodes[current_id as usize].path_hash;
                    nodes.push(BuildNode {
                        parent_id: current_id,
                        name: key.name.clone(),
                        is_dir: !is_terminal || entry.is_dir,
                        size: 0,
                        created_unix_ns: 0,
                        modified_unix_ns: 0,
                        explicit: false,
                        path_hash: hash_child_path(parent_hash, current_id == 0, component),
                        children: Vec::new(),
                    });
                    nodes[current_id as usize].children.push(id);
                    ids_by_key.insert(key, id);
                    id
                };

                if is_terminal {
                    let node = &mut nodes[next_id as usize];
                    node.is_dir = entry.is_dir;
                    node.size = entry.size;
                    node.created_unix_ns = entry.created_unix_ns;
                    node.modified_unix_ns = entry.modified_unix_ns;
                    node.explicit = true;
                } else {
                    nodes[next_id as usize].is_dir = true;
                }

                current_id = next_id;
            }
        }

        let node_names: Vec<Vec<u8>> = nodes.iter().map(|node| node.name.clone()).collect();
        for node in &mut nodes {
            node.children.sort_unstable_by(|a, b| {
                let left = &node_names[*a as usize];
                let right = &node_names[*b as usize];
                left.cmp(right)
            });
        }

        let mut names = Vec::new();
        let mut disk_nodes = Vec::with_capacity(nodes.len());
        let mut edges = Vec::new();
        let mut hashes = Vec::with_capacity(nodes.len());

        for (index, node) in nodes.iter().enumerate() {
            let name_offset = u32::try_from(names.len())
                .map_err(|_| Error::InvalidFormat("name blob too large"))?;
            let name_len = u16::try_from(node.name.len())
                .map_err(|_| Error::InvalidFormat("name too long"))?;
            names.extend_from_slice(&node.name);

            let first_child_edge = u32::try_from(edges.len())
                .map_err(|_| Error::InvalidFormat("too many child edges"))?;
            edges.extend_from_slice(&node.children);
            let child_count = u32::try_from(node.children.len())
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

        serialize_snapshot(&disk_nodes, &edges, &names, &hashes)
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
