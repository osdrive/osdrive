mod share_upload;
mod vfs_model;

use std::{
    ffi::{c_char, CStr, CString},
    panic, ptr,
};

use serde::Serialize;

#[repr(C)]
pub struct OpendriveShareUploadResult {
    share_url: *mut c_char,
    error_message: *mut c_char,
}

#[repr(C)]
pub struct OpendriveJsonResult {
    payload_json: *mut c_char,
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
pub extern "C" fn opendrive_share_prepare_file(
    source_file_path: *const c_char,
    suggested_name: *const c_char,
    temporary_directory: *const c_char,
) -> *mut OpendriveJsonResult {
    catch_json_result(|| {
        let source_file_path = c_string_arg(source_file_path, "source_file_path")?;
        let suggested_name = c_string_arg(suggested_name, "suggested_name")?;
        let temporary_directory = c_string_arg(temporary_directory, "temporary_directory")?;

        share_upload::prepare_shared_file(&source_file_path, &suggested_name, &temporary_directory)
            .map_err(|error| error.to_string())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn opendrive_share_describe_file(
    source_file_path: *const c_char,
) -> *mut OpendriveJsonResult {
    catch_json_result(|| {
        let source_file_path = c_string_arg(source_file_path, "source_file_path")?;
        share_upload::describe_shared_file(&source_file_path).map_err(|error| error.to_string())
    })
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

#[unsafe(no_mangle)]
pub extern "C" fn opendrive_vfs_item_json(identifier: *const c_char) -> *mut OpendriveJsonResult {
    catch_json_result(|| {
        let identifier = c_string_arg(identifier, "identifier")?;
        vfs_model::item(&identifier).ok_or_else(|| "No such item.".to_string())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn opendrive_vfs_enumeration_json(
    identifier: *const c_char,
) -> *mut OpendriveJsonResult {
    catch_json_result(|| {
        let identifier = c_string_arg(identifier, "identifier")?;
        vfs_model::enumerate(&identifier).ok_or_else(|| "No such item.".to_string())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn opendrive_vfs_materialize_item_json(
    identifier: *const c_char,
    destination_path: *const c_char,
) -> *mut OpendriveJsonResult {
    catch_json_result(|| {
        let identifier = c_string_arg(identifier, "identifier")?;
        let destination_path = c_string_arg(destination_path, "destination_path")?;
        vfs_model::materialize_item(&identifier, &destination_path)
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn opendrive_json_result_free(result: *mut OpendriveJsonResult) {
    if result.is_null() {
        return;
    }

    unsafe {
        let result = Box::from_raw(result);

        if !result.payload_json.is_null() {
            drop(CString::from_raw(result.payload_json));
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

fn catch_json_result<T, F>(f: F) -> *mut OpendriveJsonResult
where
    T: Serialize,
    F: FnOnce() -> Result<T, String> + panic::UnwindSafe,
{
    match panic::catch_unwind(f) {
        Ok(Ok(value)) => boxed_json_success(value),
        Ok(Err(error)) => boxed_json_error(error),
        Err(_) => boxed_json_error("The VFS operation crashed unexpectedly.".to_string()),
    }
}

fn boxed_json_success<T: Serialize>(value: T) -> *mut OpendriveJsonResult {
    match serde_json::to_string(&value) {
        Ok(payload_json) => Box::into_raw(Box::new(OpendriveJsonResult {
            payload_json: into_raw_c_string(payload_json),
            error_message: ptr::null_mut(),
        })),
        Err(error) => boxed_json_error(error.to_string()),
    }
}

fn boxed_json_error(error_message: String) -> *mut OpendriveJsonResult {
    Box::into_raw(Box::new(OpendriveJsonResult {
        payload_json: ptr::null_mut(),
        error_message: into_raw_c_string(error_message),
    }))
}
