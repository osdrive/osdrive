#ifndef OSDRIVE_SHARE_FFI_H
#define OSDRIVE_SHARE_FFI_H

#include <stdbool.h>

typedef struct OsdriveShareUploadResult {
    char *share_url;
    char *error_message;
} OsdriveShareUploadResult;

typedef struct OsdriveJsonResult {
    char *payload_json;
    char *error_message;
} OsdriveJsonResult;

OsdriveShareUploadResult *osdrive_share_upload(const char *server_base_url,
                                                   const char *file_path,
                                                   const char *display_name,
                                                   const char *content_type);
OsdriveJsonResult *osdrive_share_prepare_file(const char *source_file_path,
                                                   const char *suggested_name,
                                                   const char *temporary_directory);
OsdriveJsonResult *osdrive_share_describe_file(const char *source_file_path);
OsdriveJsonResult *osdrive_share_describe_file_url_string(const char *file_url_string);
OsdriveJsonResult *osdrive_share_normalize_display_name(const char *display_name);
OsdriveJsonResult *osdrive_share_load_attempts(const char *registered_type_identifiers_json,
                                                   _Bool has_generic_item,
                                                   _Bool has_file_url);

void osdrive_share_result_free(OsdriveShareUploadResult *result);

OsdriveJsonResult *osdrive_vfs_item_json(const char *identifier);
OsdriveJsonResult *osdrive_vfs_enumeration_json(const char *identifier);
OsdriveJsonResult *osdrive_vfs_fetch_contents_json(const char *identifier,
                                                       const char *destination_directory);

void osdrive_json_result_free(OsdriveJsonResult *result);

#endif
