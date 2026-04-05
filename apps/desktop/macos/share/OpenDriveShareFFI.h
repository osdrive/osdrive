#ifndef OPENDRIVE_SHARE_FFI_H
#define OPENDRIVE_SHARE_FFI_H

typedef struct OpendriveShareUploadResult {
    char *share_url;
    char *error_message;
} OpendriveShareUploadResult;

typedef struct OpendriveJsonResult {
    char *payload_json;
    char *error_message;
} OpendriveJsonResult;

OpendriveShareUploadResult *opendrive_share_upload(const char *server_base_url,
                                                   const char *file_path,
                                                   const char *display_name,
                                                   const char *content_type);
OpendriveJsonResult *opendrive_share_prepare_file(const char *source_file_path,
                                                   const char *suggested_name,
                                                   const char *temporary_directory);
OpendriveJsonResult *opendrive_share_describe_file(const char *source_file_path);
OpendriveJsonResult *opendrive_share_normalize_display_name(const char *display_name);

void opendrive_share_result_free(OpendriveShareUploadResult *result);

OpendriveJsonResult *opendrive_vfs_item_json(const char *identifier);
OpendriveJsonResult *opendrive_vfs_enumeration_json(const char *identifier);
OpendriveJsonResult *opendrive_vfs_fetch_contents_json(const char *identifier,
                                                       const char *destination_directory);

void opendrive_json_result_free(OpendriveJsonResult *result);

#endif
