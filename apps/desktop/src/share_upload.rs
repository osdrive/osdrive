use std::{
    fs::{self, File},
    io::{self, BufWriter, Write},
    path::{Path, PathBuf},
    time::Duration,
};

use reqwest::{blocking::Client, StatusCode, Url};
use serde::{Deserialize, Serialize};

const DISPLAY_NAME_LIMIT: usize = 180;
const DEFAULT_CONTENT_TYPE: &str = "application/octet-stream";

#[derive(Debug, Serialize)]
pub struct PreparedSharedFile {
    #[serde(rename = "filePath")]
    pub file_path: String,
    #[serde(rename = "suggestedName")]
    pub suggested_name: String,
    #[serde(rename = "contentType")]
    pub content_type: String,
}

#[derive(Debug, Serialize)]
pub struct ShareLoadAttempt {
    pub kind: &'static str,
    #[serde(rename = "typeIdentifier")]
    pub type_identifier: String,
}

#[derive(Debug, Serialize)]
pub struct MaybePreparedSharedFile {
    pub matched: bool,
    #[serde(rename = "filePath")]
    pub file_path: Option<String>,
    #[serde(rename = "suggestedName")]
    pub suggested_name: Option<String>,
    #[serde(rename = "contentType")]
    pub content_type: Option<String>,
}

#[derive(Debug, Deserialize)]
struct UploadResponse {
    #[serde(rename = "shareUrl")]
    share_url: String,
}

#[derive(Debug, Deserialize)]
struct ServerErrorResponse {
    error: String,
}

pub fn sanitize_display_name(name: &str) -> String {
    let normalized = name.split_whitespace().collect::<Vec<_>>().join(" ");

    if normalized.is_empty() {
        return "Untitled file".to_string();
    }

    normalized.chars().take(DISPLAY_NAME_LIMIT).collect()
}

pub fn normalize_display_name(name: &str) -> Result<String, ShareUploadError> {
    let normalized = name.split_whitespace().collect::<Vec<_>>().join(" ");

    if normalized.is_empty() {
        return Err(ShareUploadError::Message(
            "Enter the file name you want people to see.".to_string(),
        ));
    }

    Ok(normalized.chars().take(DISPLAY_NAME_LIMIT).collect())
}

pub fn load_attempts(
    registered_type_identifiers: Vec<String>,
    has_generic_item: bool,
    has_file_url: bool,
) -> Vec<ShareLoadAttempt> {
    let mut attempts = Vec::new();
    let mut seen = std::collections::HashSet::new();

    for identifier in registered_type_identifiers {
        if seen.insert(("file_representation", identifier.clone())) {
            attempts.push(ShareLoadAttempt {
                kind: "file_representation",
                type_identifier: identifier,
            });
        }
    }

    if has_generic_item {
        let identifier = "public.item".to_string();
        if seen.insert(("file_representation", identifier.clone())) {
            attempts.push(ShareLoadAttempt {
                kind: "file_representation",
                type_identifier: identifier,
            });
        }
    }

    if has_file_url {
        let identifier = "public.file-url".to_string();
        if seen.insert(("file_url", identifier.clone())) {
            attempts.push(ShareLoadAttempt {
                kind: "file_url",
                type_identifier: identifier,
            });
        }
    }

    attempts
}

pub fn upload_shared_file(
    server_base_url: &str,
    file_path: &str,
    display_name: &str,
    content_type: &str,
) -> Result<String, ShareUploadError> {
    let endpoint_url = desktop_shares_endpoint_url(server_base_url)?;
    let file_path = Path::new(file_path);

    if !file_path.is_file() {
        return Err(ShareUploadError::Message(
            "The shared file could not be found on disk.".to_string(),
        ));
    }

    let boundary = format!(
        "Boundary-{:016x}{:016x}",
        rand::random::<u64>(),
        rand::random::<u64>()
    );
    let body_path = create_multipart_body_file(
        file_path,
        &sanitize_display_name(display_name),
        normalized_content_type(content_type),
        &boundary,
    )?;

    let result = upload_multipart_file(&endpoint_url, &body_path, &boundary);
    let _ = fs::remove_file(&body_path);
    result
}

pub fn prepare_shared_file(
    source_file_path: &str,
    suggested_name: &str,
    temporary_directory: &str,
) -> Result<PreparedSharedFile, ShareUploadError> {
    let source_path = Path::new(source_file_path);

    if !source_path.is_file() {
        return Err(ShareUploadError::Message(
            "The shared file could not be found on disk.".to_string(),
        ));
    }

    let temp_directory = Path::new(temporary_directory);
    fs::create_dir_all(temp_directory)?;

    let destination_path = unique_temporary_path(temp_directory, suggested_name);
    if destination_path.exists() {
        fs::remove_file(&destination_path)?;
    }

    fs::copy(source_path, &destination_path)?;

    let suggested_name = source_path
        .file_name()
        .and_then(|name| name.to_str())
        .filter(|name| !name.is_empty())
        .unwrap_or("Untitled file")
        .to_string();

    Ok(PreparedSharedFile {
        file_path: destination_path.to_string_lossy().into_owned(),
        suggested_name,
        content_type: detect_content_type(&destination_path),
    })
}

pub fn describe_shared_file(
    source_file_path: &str,
) -> Result<PreparedSharedFile, ShareUploadError> {
    let source_path = Path::new(source_file_path);

    if !source_path.is_file() {
        return Err(ShareUploadError::Message(
            "The shared file could not be found on disk.".to_string(),
        ));
    }

    let suggested_name = source_path
        .file_name()
        .and_then(|name| name.to_str())
        .filter(|name| !name.is_empty())
        .unwrap_or("Untitled file")
        .to_string();

    Ok(PreparedSharedFile {
        file_path: source_path.to_string_lossy().into_owned(),
        suggested_name,
        content_type: detect_content_type(source_path),
    })
}

pub fn describe_shared_file_url_string(
    file_url_string: &str,
) -> Result<PreparedSharedFile, ShareUploadError> {
    let url = Url::parse(file_url_string)
        .map_err(|_| ShareUploadError::Message("The shared file URL was invalid.".to_string()))?;

    if url.scheme() != "file" {
        return Err(ShareUploadError::Message(
            "The shared item was not a file URL.".to_string(),
        ));
    }

    let path = url.to_file_path().map_err(|_| {
        ShareUploadError::Message("The shared file URL could not be resolved.".to_string())
    })?;

    describe_shared_file(&path.to_string_lossy())
}

pub fn maybe_describe_shared_file_url_string(
    file_url_string: &str,
) -> Result<MaybePreparedSharedFile, ShareUploadError> {
    match Url::parse(file_url_string) {
        Ok(url) if url.scheme() == "file" => {
            let prepared = describe_shared_file_url_string(file_url_string)?;
            Ok(MaybePreparedSharedFile {
                matched: true,
                file_path: Some(prepared.file_path),
                suggested_name: Some(prepared.suggested_name),
                content_type: Some(prepared.content_type),
            })
        }
        Ok(_) | Err(_) => Ok(MaybePreparedSharedFile {
            matched: false,
            file_path: None,
            suggested_name: None,
            content_type: None,
        }),
    }
}

fn desktop_shares_endpoint_url(server_base_url: &str) -> Result<Url, ShareUploadError> {
    let base = Url::parse(server_base_url).map_err(|_| {
        ShareUploadError::Message(
            "Missing OSDriveServerURL in the share extension configuration.".to_string(),
        )
    })?;

    base.join("/api/v1/desktop/shares").map_err(|_| {
        ShareUploadError::Message("Could not construct the desktop share upload URL.".to_string())
    })
}

fn normalized_content_type(content_type: &str) -> &str {
    let trimmed = content_type.trim();
    if trimmed.is_empty() {
        DEFAULT_CONTENT_TYPE
    } else {
        trimmed
    }
}

fn detect_content_type(path: &Path) -> String {
    mime_guess::from_path(path)
        .first_raw()
        .unwrap_or(DEFAULT_CONTENT_TYPE)
        .to_string()
}

fn unique_temporary_path(directory: &Path, suggested_name: &str) -> PathBuf {
    let clean_name = if suggested_name.trim().is_empty() {
        "shared-file"
    } else {
        suggested_name
    };

    directory.join(format!("{}-{}", uuid_fragment(), clean_name))
}

fn uuid_fragment() -> String {
    format!(
        "{:08x}{:08x}{:08x}{:08x}",
        rand::random::<u32>(),
        rand::random::<u32>(),
        rand::random::<u32>(),
        rand::random::<u32>()
    )
}

fn create_multipart_body_file(
    file_path: &Path,
    display_name: &str,
    content_type: &str,
    boundary: &str,
) -> Result<PathBuf, ShareUploadError> {
    let body_path = std::env::temp_dir().join(format!(
        "osdrive-share-{}-{}.multipart",
        std::process::id(),
        rand::random::<u64>()
    ));

    let body_file = File::create(&body_path)
        .map_err(|_| ShareUploadError::Message("Could not prepare the upload body.".to_string()))?;
    let mut writer = BufWriter::new(body_file);

    write!(
        writer,
        "--{boundary}\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\n{display_name}\r\n"
    )?;

    let original_name = file_path
        .file_name()
        .and_then(|name| name.to_str())
        .filter(|name| !name.is_empty())
        .unwrap_or("shared-file");
    let escaped_file_name = original_name.replace('\\', "\\\\").replace('"', "\\\"");

    write!(
        writer,
        "--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{escaped_file_name}\"\r\nContent-Type: {content_type}\r\n\r\n"
    )?;

    let mut source = File::open(file_path)?;
    io::copy(&mut source, &mut writer)?;
    write!(writer, "\r\n--{boundary}--\r\n")?;
    writer.flush()?;

    Ok(body_path)
}

fn upload_multipart_file(
    endpoint_url: &Url,
    body_path: &Path,
    boundary: &str,
) -> Result<String, ShareUploadError> {
    let client = Client::builder()
        .timeout(Duration::from_secs(60 * 10))
        .build()?;

    let body_file = File::open(body_path)?;
    let response = client
        .post(endpoint_url.clone())
        .header(
            "Content-Type",
            format!("multipart/form-data; boundary={boundary}"),
        )
        .body(reqwest::blocking::Body::new(body_file))
        .send()?;

    let status = response.status();
    let bytes = response.bytes()?;

    if !status.is_success() {
        return Err(ShareUploadError::Message(server_error_message(
            status, &bytes,
        )));
    }

    let payload: UploadResponse = serde_json::from_slice(&bytes)?;
    Ok(payload.share_url)
}

fn server_error_message(status: StatusCode, bytes: &[u8]) -> String {
    serde_json::from_slice::<ServerErrorResponse>(bytes)
        .map(|payload| payload.error)
        .unwrap_or_else(|_| {
            if status.is_server_error() {
                "Upload failed. Try again in a moment.".to_string()
            } else {
                "Upload failed.".to_string()
            }
        })
}

#[derive(Debug)]
pub enum ShareUploadError {
    Message(String),
    Io(io::Error),
    Network(reqwest::Error),
    Json(serde_json::Error),
}

impl std::fmt::Display for ShareUploadError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Message(message) => f.write_str(message),
            Self::Io(error) => write!(f, "{error}"),
            Self::Network(error) => {
                if error.is_timeout() {
                    f.write_str("Upload timed out. Try again in a moment.")
                } else {
                    write!(f, "{error}")
                }
            }
            Self::Json(error) => write!(f, "{error}"),
        }
    }
}

impl std::error::Error for ShareUploadError {}

impl From<io::Error> for ShareUploadError {
    fn from(error: io::Error) -> Self {
        Self::Io(error)
    }
}

impl From<reqwest::Error> for ShareUploadError {
    fn from(error: reqwest::Error) -> Self {
        Self::Network(error)
    }
}

impl From<serde_json::Error> for ShareUploadError {
    fn from(error: serde_json::Error) -> Self {
        Self::Json(error)
    }
}
