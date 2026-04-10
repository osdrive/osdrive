use crate::{UPLOAD_URL, UploadError};

pub async fn upload() -> Result<String, UploadError> {
    let response = reqwest::get(UPLOAD_URL)
        .await
        .map_err(|error| UploadError::Network(error.to_string()))?;
    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|error| UploadError::Network(error.to_string()))?;

    if !status.is_success() {
        return Err(UploadError::HttpStatus(status.as_u16(), body));
    }

    Ok(body)
}
