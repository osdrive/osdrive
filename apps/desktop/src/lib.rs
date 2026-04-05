mod share_upload;

use std::{
    ffi::{CStr, CString, c_char},
    panic,
    ptr,
};

#[repr(C)]
pub struct OpendriveShareUploadResult {
    share_url: *mut c_char,
    error_message: *mut c_char,
}

#[unsafe(no_mangle)]
pub extern "C" fn opendrive_share_upload(
    server_base_url: *const c_char,
    file_path: *const c_char,
    display_name: *const c_char,
    content_type: *const c_char,
) -> *mut OpendriveShareUploadResult {
    let result = panic::catch_unwind(|| {
        let server_base_url = match c_string_arg(server_base_url, "server_base_url") {
            Ok(value) => value,
            Err(error) => return boxed_error(error),
        };

        let file_path = match c_string_arg(file_path, "file_path") {
            Ok(value) => value,
            Err(error) => return boxed_error(error),
        };

        let display_name = match c_string_arg(display_name, "display_name") {
            Ok(value) => value,
            Err(error) => return boxed_error(error),
        };

        let content_type = match c_string_arg(content_type, "content_type") {
            Ok(value) => value,
            Err(error) => return boxed_error(error),
        };

        match share_upload::upload_shared_file(
            &server_base_url,
            &file_path,
            &display_name,
            &content_type,
        ) {
            Ok(share_url) => boxed_success(share_url),
            Err(error) => boxed_error(error.to_string()),
        }
    });

    match result {
        Ok(value) => value,
        Err(_) => boxed_error("The share upload crashed unexpectedly.".to_string()),
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn opendrive_share_result_free(result: *mut OpendriveShareUploadResult) {
    if result.is_null() {
        return;
    }

    unsafe {
        let result = Box::from_raw(result);

        if !result.share_url.is_null() {
            drop(CString::from_raw(result.share_url));
        }

        if !result.error_message.is_null() {
            drop(CString::from_raw(result.error_message));
        }
    }
}

fn c_string_arg(value: *const c_char, name: &str) -> Result<String, String> {
    if value.is_null() {
        return Err(format!("Missing {name}."));
    }

    unsafe {
        CStr::from_ptr(value)
            .to_str()
            .map(|value| value.to_owned())
            .map_err(|_| format!("{name} was not valid UTF-8."))
    }
}

fn boxed_success(share_url: String) -> *mut OpendriveShareUploadResult {
    Box::into_raw(Box::new(OpendriveShareUploadResult {
        share_url: into_raw_c_string(share_url),
        error_message: ptr::null_mut(),
    }))
}

fn boxed_error(error_message: String) -> *mut OpendriveShareUploadResult {
    Box::into_raw(Box::new(OpendriveShareUploadResult {
        share_url: ptr::null_mut(),
        error_message: into_raw_c_string(error_message),
    }))
}

fn into_raw_c_string(value: String) -> *mut c_char {
    let mut bytes = value.into_bytes();
    bytes.retain(|byte| *byte != 0);
    CString::new(bytes)
        .expect("CString::new cannot fail after NUL removal")
        .into_raw()
}
