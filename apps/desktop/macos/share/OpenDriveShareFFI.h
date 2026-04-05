#ifndef OPENDRIVE_SHARE_FFI_H
#define OPENDRIVE_SHARE_FFI_H

#include <stdint.h>

typedef struct OpendriveShareUploadResult {
    char *share_url;
    char *error_message;
} OpendriveShareUploadResult;

OpendriveShareUploadResult *opendrive_share_upload(const char *server_base_url,
                                                   const char *file_path,
                                                   const char *display_name,
                                                   const char *content_type);

void opendrive_share_result_free(OpendriveShareUploadResult *result);

#endif
