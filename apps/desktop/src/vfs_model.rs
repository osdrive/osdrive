use serde::Serialize;
use std::{
    fs,
    path::{Path, PathBuf},
};

pub const ROOT_IDENTIFIER: &str = "__root__";
pub const WORKING_SET_IDENTIFIER: &str = "__working_set__";
pub const DOMAIN_DISPLAY_NAME: &str = "OSDrive";

const HELLO_FILE_IDENTIFIER: &str = "hello.txt";
const CONTENT_VERSION: &[u8] = b"1";
const METADATA_VERSION: &[u8] = b"1";
const TIMESTAMP_UNIX: i64 = 1_704_067_200;

const CAPABILITY_ALLOWS_READING: u64 = 1 << 1;
const CAPABILITY_ALLOWS_CONTENT_ENUMERATING: u64 = 1 << 6;

#[derive(Clone, Debug, Serialize)]
pub struct Item {
    #[serde(rename = "itemIdentifier")]
    pub item_identifier: String,
    #[serde(rename = "parentItemIdentifier")]
    pub parent_item_identifier: String,
    pub filename: String,
    #[serde(rename = "contentType")]
    pub content_type: String,
    pub capabilities: u64,
    #[serde(rename = "childItemCount")]
    pub child_item_count: Option<u64>,
    #[serde(rename = "documentSize")]
    pub document_size: Option<u64>,
    #[serde(rename = "creationTimestamp")]
    pub creation_timestamp: i64,
    #[serde(rename = "contentModificationTimestamp")]
    pub content_modification_timestamp: i64,
    #[serde(rename = "contentVersion")]
    pub content_version: Vec<u8>,
    #[serde(rename = "metadataVersion")]
    pub metadata_version: Vec<u8>,
}

#[derive(Clone, Debug, Serialize)]
pub struct Enumeration {
    pub items: Vec<Item>,
    #[serde(rename = "syncAnchor")]
    pub sync_anchor: Vec<u8>,
}

#[derive(Clone, Debug, Serialize)]
pub struct MaterializedItem {
    #[serde(rename = "filePath")]
    pub file_path: String,
    pub item: Item,
}

pub fn item(identifier: &str) -> Option<Item> {
    match identifier {
        ROOT_IDENTIFIER => Some(root_item()),
        HELLO_FILE_IDENTIFIER => Some(hello_file()),
        _ => None,
    }
}

pub fn children(identifier: &str) -> Vec<Item> {
    if identifier == ROOT_IDENTIFIER {
        vec![hello_file()]
    } else {
        Vec::new()
    }
}

pub fn enumerate(identifier: &str) -> Option<Enumeration> {
    match identifier {
        ROOT_IDENTIFIER => Some(Enumeration {
            items: children(ROOT_IDENTIFIER),
            sync_anchor: sync_anchor(),
        }),
        WORKING_SET_IDENTIFIER => Some(Enumeration {
            items: Vec::new(),
            sync_anchor: sync_anchor(),
        }),
        _ => None,
    }
}

pub fn sync_anchor() -> Vec<u8> {
    b"an anchor".to_vec()
}

pub fn file_contents(identifier: &str) -> Option<Vec<u8>> {
    match identifier {
        HELLO_FILE_IDENTIFIER => Some(b"Hello World".to_vec()),
        _ => None,
    }
}

pub fn materialize_file(identifier: &str, destination_path: &str) -> Result<(), String> {
    let contents = file_contents(identifier).ok_or_else(|| "No such item.".to_string())?;
    let path = Path::new(destination_path);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }

    fs::write(path, contents).map_err(|error| error.to_string())
}

pub fn materialize_item(identifier: &str, destination_path: &str) -> Result<Item, String> {
    materialize_file(identifier, destination_path)?;
    item(identifier).ok_or_else(|| "No such item.".to_string())
}

pub fn materialize_into_directory(
    identifier: &str,
    destination_directory: &str,
) -> Result<MaterializedItem, String> {
    let item = item(identifier).ok_or_else(|| "No such item.".to_string())?;
    let directory = Path::new(destination_directory);
    fs::create_dir_all(directory).map_err(|error| error.to_string())?;

    let destination_path = directory.join(safe_filename(&item.filename));
    if destination_path.exists() {
        fs::remove_file(&destination_path).map_err(|error| error.to_string())?;
    }

    let materialized_item = materialize_item(identifier, &destination_path.to_string_lossy())?;
    Ok(MaterializedItem {
        file_path: destination_path.to_string_lossy().into_owned(),
        item: materialized_item,
    })
}

fn safe_filename(filename: &str) -> PathBuf {
    let trimmed = filename.trim();
    if trimmed.is_empty() {
        return PathBuf::from("item");
    }

    let sanitized = trimmed
        .chars()
        .map(|character| match character {
            '/' | ':' => '_',
            _ => character,
        })
        .collect::<String>();

    PathBuf::from(sanitized)
}

fn root_item() -> Item {
    Item {
        item_identifier: ROOT_IDENTIFIER.to_string(),
        parent_item_identifier: ROOT_IDENTIFIER.to_string(),
        filename: DOMAIN_DISPLAY_NAME.to_string(),
        content_type: "public.folder".to_string(),
        capabilities: CAPABILITY_ALLOWS_CONTENT_ENUMERATING,
        child_item_count: Some(1),
        document_size: None,
        creation_timestamp: TIMESTAMP_UNIX,
        content_modification_timestamp: TIMESTAMP_UNIX,
        content_version: CONTENT_VERSION.to_vec(),
        metadata_version: METADATA_VERSION.to_vec(),
    }
}

fn hello_file() -> Item {
    let content = b"Hello World";
    Item {
        item_identifier: HELLO_FILE_IDENTIFIER.to_string(),
        parent_item_identifier: ROOT_IDENTIFIER.to_string(),
        filename: HELLO_FILE_IDENTIFIER.to_string(),
        content_type: "public.plain-text".to_string(),
        capabilities: CAPABILITY_ALLOWS_READING,
        child_item_count: None,
        document_size: Some(content.len() as u64),
        creation_timestamp: TIMESTAMP_UNIX,
        content_modification_timestamp: TIMESTAMP_UNIX,
        content_version: CONTENT_VERSION.to_vec(),
        metadata_version: METADATA_VERSION.to_vec(),
    }
}
