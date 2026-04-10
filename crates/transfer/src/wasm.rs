use crate::{UPLOAD_URL, UploadError};

pub async fn upload() -> Result<String, UploadError> {
    let response = gloo_net::http::Request::get(UPLOAD_URL)
        .send()
        .await
        .map_err(|error| UploadError::Network(error.to_string()))?;
    let status = response.status();
    let ok = response.ok();
    let body = response
        .text()
        .await
        .map_err(|error| UploadError::Network(error.to_string()))?;

    if !ok {
        return Err(UploadError::HttpStatus(status, body));
    }

    Ok(body)
}
