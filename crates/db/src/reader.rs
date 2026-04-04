use crate::builder::{DbStats, DbSummary};
use crate::error::{Error, Result};
use crate::format::{
    read_i64, read_u16, read_u32, read_u64, DiskNode, FLAG_DIR, FLAG_EXPLICIT, HEADER_LEN, MAGIC,
    NODE_LEN, PATH_HASH_LEN, VERSION,
};
use crate::path::{components, hash_path, normalize_path};
use std::borrow::Cow;
use std::fs;
use std::io::Read;
use std::path::Path;

pub type NodeId = u32;

#[derive(Clone, Copy, Debug)]
struct StoredNode {
    parent_id: u32,
    first_child_edge: u32,
    child_count: u32,
    name_offset: u32,
    name_len: u16,
    flags: u16,
    size: u64,
    created_unix_ns: i64,
    modified_unix_ns: i64,
}

#[derive(Clone, Copy, Debug)]
struct StoredHash {
    hash: u64,
    node_id: u32,
}

#[derive(Clone, Copy, Debug)]
pub struct NodeRecord<'a> {
    pub id: NodeId,
    pub parent: Option<NodeId>,
    pub name: &'a [u8],
    pub is_dir: bool,
    pub is_explicit: bool,
    pub size: u64,
    pub created_unix_ns: i64,
    pub modified_unix_ns: i64,
}

pub struct Db {
    nodes: Vec<StoredNode>,
    edges: Vec<u32>,
    names: Vec<u8>,
    hashes: Vec<StoredHash>,
    root_id: NodeId,
    summary: DbSummary,
}

impl Db {
    pub fn open(path: impl AsRef<Path>) -> Result<Self> {
        let bytes = fs::read(path)?;
        Self::from_bytes(bytes)
    }

    pub fn read_summary(path: impl AsRef<Path>) -> Result<DbSummary> {
        let mut file = fs::File::open(path)?;
        let mut header = [0; HEADER_LEN];
        file.read_exact(&mut header)?;
        Ok(parse_header(&header)?.summary)
    }

    pub fn from_bytes(bytes: Vec<u8>) -> Result<Self> {
        let header = parse_header(&bytes)?;
        let root_id = header.root_id;
        let node_count = header.node_count;
        let edge_count = header.edge_count;
        let nodes_offset = header.nodes_offset;
        let edges_offset = header.edges_offset;
        let names_offset = header.names_offset;
        let names_len = header.names_len;
        let hashes_offset = header.hashes_offset;
        let hash_count = header.hash_count;

        let nodes_end = nodes_offset
            .checked_add(node_count * NODE_LEN)
            .ok_or(Error::InvalidFormat("nodes overflow"))?;
        let edges_end = edges_offset
            .checked_add(edge_count * 4)
            .ok_or(Error::InvalidFormat("edges overflow"))?;
        let names_end = names_offset
            .checked_add(names_len)
            .ok_or(Error::InvalidFormat("names overflow"))?;
        let hashes_end = hashes_offset
            .checked_add(hash_count * PATH_HASH_LEN)
            .ok_or(Error::InvalidFormat("hashes overflow"))?;

        if hashes_end > bytes.len()
            || nodes_end > bytes.len()
            || edges_end > bytes.len()
            || names_end > bytes.len()
        {
            return Err(Error::InvalidFormat("section exceeds file bounds"));
        }

        let mut nodes = Vec::with_capacity(node_count);
        for index in 0..node_count {
            let offset = nodes_offset + index * NODE_LEN;
            nodes.push(parse_node(&bytes[offset..offset + NODE_LEN])?);
        }

        let mut edges = Vec::with_capacity(edge_count);
        for index in 0..edge_count {
            let offset = edges_offset + index * 4;
            edges.push(read_u32(&bytes, offset).ok_or(Error::InvalidFormat("invalid edge"))?);
        }

        let names = bytes[names_offset..names_end].to_vec();

        let mut hashes = Vec::with_capacity(hash_count);
        for index in 0..hash_count {
            let offset = hashes_offset + index * PATH_HASH_LEN;
            hashes.push(StoredHash {
                hash: read_u64(&bytes, offset).ok_or(Error::InvalidFormat("invalid hash"))?,
                node_id: read_u32(&bytes, offset + 8)
                    .ok_or(Error::InvalidFormat("invalid hash node id"))?,
            });
        }

        let db = Self {
            nodes,
            edges,
            names,
            hashes,
            root_id,
            summary: header.summary,
        };
        db.validate()?;
        Ok(db)
    }

    pub fn root_id(&self) -> NodeId {
        self.root_id
    }

    pub fn node_count(&self) -> usize {
        self.nodes.len()
    }

    pub fn summary(&self) -> DbSummary {
        self.summary
    }

    pub fn stats(&self) -> DbStats {
        self.summary.stats
    }

    pub fn get(&self, id: NodeId) -> Option<NodeRecord<'_>> {
        let node = self.nodes.get(id as usize)?;
        let name = self.name_bytes(node)?;
        Some(NodeRecord {
            id,
            parent: if id == self.root_id {
                None
            } else {
                Some(node.parent_id)
            },
            name,
            is_dir: node.flags & FLAG_DIR != 0,
            is_explicit: node.flags & FLAG_EXPLICIT != 0,
            size: node.size,
            created_unix_ns: node.created_unix_ns,
            modified_unix_ns: node.modified_unix_ns,
        })
    }

    pub fn parent(&self, id: NodeId) -> Option<NodeId> {
        if id == self.root_id {
            return None;
        }
        self.nodes.get(id as usize).map(|node| node.parent_id)
    }

    pub fn children(&self, id: NodeId) -> Result<&[NodeId]> {
        let node = self
            .nodes
            .get(id as usize)
            .ok_or(Error::InvalidFormat("invalid node id"))?;
        let start = node.first_child_edge as usize;
        let end = start + node.child_count as usize;
        self.edges
            .get(start..end)
            .ok_or(Error::InvalidFormat("invalid child edge range"))
    }

    pub fn lookup_child(&self, parent: NodeId, name: &[u8]) -> Option<NodeId> {
        let normalized = match normalize_name(name) {
            Some(name) => name,
            None => return None,
        };
        let children = self.children(parent).ok()?;
        let mut left = 0usize;
        let mut right = children.len();
        while left < right {
            let mid = left + (right - left) / 2;
            let child_id = children[mid];
            let child = self.nodes.get(child_id as usize)?;
            match self.name_bytes(child)?.cmp(normalized.as_ref()) {
                std::cmp::Ordering::Less => left = mid + 1,
                std::cmp::Ordering::Greater => right = mid,
                std::cmp::Ordering::Equal => return Some(child_id),
            }
        }
        None
    }

    pub fn lookup_path(&self, path: &[u8]) -> Option<NodeId> {
        let normalized = normalize_path(path).ok()?;
        let hash = hash_path(&normalized);

        let mut left = self.hashes.partition_point(|entry| entry.hash < hash);
        let right = self.hashes.partition_point(|entry| entry.hash <= hash);
        while left < right {
            let node_id = self.hashes[left].node_id;
            if self.path_bytes(node_id).ok()?.as_ref() == normalized.as_slice() {
                return Some(node_id);
            }
            left += 1;
        }

        let mut current = self.root_id;
        for component in components(&normalized) {
            current = self.lookup_child(current, component)?;
        }
        Some(current)
    }

    pub fn path_bytes(&self, id: NodeId) -> Result<Cow<'_, [u8]>> {
        let Some(_) = self.nodes.get(id as usize) else {
            return Err(Error::InvalidFormat("invalid node id"));
        };
        if id == self.root_id {
            return Ok(Cow::Borrowed(b"/"));
        }

        let mut parts = Vec::new();
        let mut current = id;
        while current != self.root_id {
            let node = self
                .nodes
                .get(current as usize)
                .ok_or(Error::InvalidFormat("invalid node id"))?;
            parts.push(
                self.name_bytes(node)
                    .ok_or(Error::InvalidFormat("node name out of bounds"))?
                    .to_vec(),
            );
            current = node.parent_id;
        }
        parts.reverse();

        let total_len = parts.iter().map(Vec::len).sum::<usize>() + parts.len();
        let mut path = Vec::with_capacity(total_len.max(1));
        for part in parts {
            path.push(b'/');
            path.extend_from_slice(&part);
        }
        Ok(Cow::Owned(path))
    }

    fn validate(&self) -> Result<()> {
        if self.root_id as usize >= self.nodes.len() {
            return Err(Error::InvalidFormat("root id out of bounds"));
        }

        for (index, node) in self.nodes.iter().enumerate() {
            if index as u32 != self.root_id && node.parent_id as usize >= self.nodes.len() {
                return Err(Error::InvalidFormat("parent id out of bounds"));
            }
            let name_end = node.name_offset as usize + node.name_len as usize;
            if name_end > self.names.len() {
                return Err(Error::InvalidFormat("node name out of bounds"));
            }
            let edge_end = node.first_child_edge as usize + node.child_count as usize;
            if edge_end > self.edges.len() {
                return Err(Error::InvalidFormat("child edge out of bounds"));
            }
        }

        for child in &self.edges {
            if *child as usize >= self.nodes.len() {
                return Err(Error::InvalidFormat("child id out of bounds"));
            }
        }

        Ok(())
    }

    fn name_bytes<'a>(&'a self, node: &StoredNode) -> Option<&'a [u8]> {
        let start = node.name_offset as usize;
        let end = start + node.name_len as usize;
        self.names.get(start..end)
    }
}

struct ParsedHeader {
    root_id: u32,
    node_count: usize,
    edge_count: usize,
    nodes_offset: usize,
    edges_offset: usize,
    names_offset: usize,
    names_len: usize,
    hashes_offset: usize,
    hash_count: usize,
    summary: DbSummary,
}

fn parse_header(bytes: &[u8]) -> Result<ParsedHeader> {
    if bytes.len() < HEADER_LEN {
        return Err(Error::InvalidFormat("file too small"));
    }
    if bytes[..MAGIC.len()] != MAGIC {
        return Err(Error::InvalidFormat("invalid magic"));
    }
    if read_u32(bytes, 8) != Some(VERSION) {
        return Err(Error::InvalidFormat("unsupported version"));
    }

    let root_id = read_u32(bytes, 12).ok_or(Error::InvalidFormat("missing root id"))?;
    let node_count =
        read_u32(bytes, 16).ok_or(Error::InvalidFormat("missing node count"))? as usize;
    let edge_count =
        read_u32(bytes, 20).ok_or(Error::InvalidFormat("missing edge count"))? as usize;
    let nodes_offset =
        read_u64(bytes, 24).ok_or(Error::InvalidFormat("missing nodes offset"))? as usize;
    let edges_offset =
        read_u64(bytes, 32).ok_or(Error::InvalidFormat("missing edges offset"))? as usize;
    let names_offset =
        read_u64(bytes, 40).ok_or(Error::InvalidFormat("missing names offset"))? as usize;
    let names_len = read_u64(bytes, 48).ok_or(Error::InvalidFormat("missing names len"))? as usize;
    let hashes_offset =
        read_u64(bytes, 56).ok_or(Error::InvalidFormat("missing hashes offset"))? as usize;
    let hash_count =
        read_u32(bytes, 64).ok_or(Error::InvalidFormat("missing hash count"))? as usize;
    let explicit_dirs =
        read_u64(bytes, 68).ok_or(Error::InvalidFormat("missing explicit dir count"))?;
    let explicit_files =
        read_u64(bytes, 76).ok_or(Error::InvalidFormat("missing explicit file count"))?;
    let explicit_nodes =
        read_u64(bytes, 84).ok_or(Error::InvalidFormat("missing explicit node count"))?;

    Ok(ParsedHeader {
        root_id,
        node_count,
        edge_count,
        nodes_offset,
        edges_offset,
        names_offset,
        names_len,
        hashes_offset,
        hash_count,
        summary: DbSummary {
            node_count,
            stats: DbStats {
                explicit_dirs,
                explicit_files,
                explicit_nodes,
            },
        },
    })
}

fn parse_node(bytes: &[u8]) -> Result<StoredNode> {
    let disk = DiskNode {
        parent_id: read_u32(bytes, 0).ok_or(Error::InvalidFormat("missing parent id"))?,
        first_child_edge: read_u32(bytes, 4)
            .ok_or(Error::InvalidFormat("missing first child edge"))?,
        child_count: read_u32(bytes, 8).ok_or(Error::InvalidFormat("missing child count"))?,
        name_offset: read_u32(bytes, 12).ok_or(Error::InvalidFormat("missing name offset"))?,
        name_len: read_u16(bytes, 16).ok_or(Error::InvalidFormat("missing name len"))?,
        flags: read_u16(bytes, 18).ok_or(Error::InvalidFormat("missing flags"))?,
        size: read_u64(bytes, 20).ok_or(Error::InvalidFormat("missing size"))?,
        created_unix_ns: read_i64(bytes, 28).ok_or(Error::InvalidFormat("missing created time"))?,
        modified_unix_ns: read_i64(bytes, 36)
            .ok_or(Error::InvalidFormat("missing modified time"))?,
    };

    Ok(StoredNode {
        parent_id: disk.parent_id,
        first_child_edge: disk.first_child_edge,
        child_count: disk.child_count,
        name_offset: disk.name_offset,
        name_len: disk.name_len,
        flags: disk.flags,
        size: disk.size,
        created_unix_ns: disk.created_unix_ns,
        modified_unix_ns: disk.modified_unix_ns,
    })
}

fn normalize_name(name: &[u8]) -> Option<Cow<'_, [u8]>> {
    if name.is_empty() || name.contains(&b'/') || name.contains(&0) || name == b"." || name == b".."
    {
        return None;
    }
    Some(Cow::Borrowed(name))
}
