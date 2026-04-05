use std::{
    fs::{self, File},
    io::{self, BufWriter, Write},
    path::{Path, PathBuf},
    time::Duration,
};

use reqwest::{blocking::Client, StatusCode, Url};
use serde::Deserialize;

const DISPLAY_NAME_LIMIT: usize = 180;
const DEFAULT_CONTENT_TYPE: &str = "application/octet-stream";

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

fn desktop_shares_endpoint_url(server_base_url: &str) -> Result<Url, ShareUploadError> {
    let base = Url::parse(server_base_url).map_err(|_| {
        ShareUploadError::Message(
            "Missing OpenDriveServerURL in the share extension configuration.".to_string(),
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

fn create_multipart_body_file(
    file_path: &Path,
    display_name: &str,
    content_type: &str,
    boundary: &str,
) -> Result<PathBuf, ShareUploadError> {
    let body_path = std::env::temp_dir().join(format!(
        "opendrive-share-{}-{}.multipart",
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
