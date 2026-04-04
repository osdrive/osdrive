pub const MAGIC: [u8; 8] = *b"ODDBSNAP";
pub const VERSION: u32 = 1;
pub const HEADER_LEN: usize = 72;
pub const NODE_LEN: usize = 44;
pub const PATH_HASH_LEN: usize = 12;

#[derive(Clone, Copy, Debug)]
pub struct Header {
    pub root_id: u32,
    pub node_count: u32,
    pub edge_count: u32,
    pub nodes_offset: u64,
    pub edges_offset: u64,
    pub names_offset: u64,
    pub names_len: u64,
    pub hashes_offset: u64,
    pub hash_count: u32,
}

#[derive(Clone, Copy, Debug)]
pub struct DiskNode {
    pub parent_id: u32,
    pub first_child_edge: u32,
    pub child_count: u32,
    pub name_offset: u32,
    pub name_len: u16,
    pub flags: u16,
    pub size: u64,
    pub created_unix_ns: i64,
    pub modified_unix_ns: i64,
}

#[derive(Clone, Copy, Debug)]
pub struct DiskPathHash {
    pub hash: u64,
    pub node_id: u32,
}

pub const FLAG_DIR: u16 = 1;

pub fn push_u16(buffer: &mut Vec<u8>, value: u16) {
    buffer.extend_from_slice(&value.to_le_bytes());
}

pub fn push_u32(buffer: &mut Vec<u8>, value: u32) {
    buffer.extend_from_slice(&value.to_le_bytes());
}

pub fn push_u64(buffer: &mut Vec<u8>, value: u64) {
    buffer.extend_from_slice(&value.to_le_bytes());
}

pub fn push_i64(buffer: &mut Vec<u8>, value: i64) {
    buffer.extend_from_slice(&value.to_le_bytes());
}

pub fn read_u16(buffer: &[u8], offset: usize) -> Option<u16> {
    let bytes = buffer.get(offset..offset + 2)?;
    Some(u16::from_le_bytes([bytes[0], bytes[1]]))
}

pub fn read_u32(buffer: &[u8], offset: usize) -> Option<u32> {
    let bytes = buffer.get(offset..offset + 4)?;
    Some(u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]))
}

pub fn read_u64(buffer: &[u8], offset: usize) -> Option<u64> {
    let bytes = buffer.get(offset..offset + 8)?;
    Some(u64::from_le_bytes([
        bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7],
    ]))
}

pub fn read_i64(buffer: &[u8], offset: usize) -> Option<i64> {
    let bytes = buffer.get(offset..offset + 8)?;
    Some(i64::from_le_bytes([
        bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7],
    ]))
}
