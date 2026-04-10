//! Cross-platform uploader entrypoint.

const UPLOAD_URL: &str = "https://example.com";

#[derive(Debug)]
pub enum UploadError {
    Network(String),
    HttpStatus(u16, String),
}

impl std::fmt::Display for UploadError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Network(message) => f.write_str(message),
            Self::HttpStatus(status, body) if body.is_empty() => {
                write!(f, "request failed with status {status}")
            }
            Self::HttpStatus(status, body) => {
                write!(f, "request failed with status {status}: {body}")
            }
        }
    }
}

impl std::error::Error for UploadError {}

#[cfg(not(target_arch = "wasm32"))]
mod native;
#[cfg(target_arch = "wasm32")]
mod wasm;

#[cfg(not(target_arch = "wasm32"))]
pub use native::upload;
#[cfg(target_arch = "wasm32")]
pub use wasm::upload;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen(js_name = upload)]
pub async fn upload_wasm() -> Result<String, wasm_bindgen::JsValue> {
    upload()
        .await
        .map_err(|error| wasm_bindgen::JsValue::from_str(&error.to_string()))
}
