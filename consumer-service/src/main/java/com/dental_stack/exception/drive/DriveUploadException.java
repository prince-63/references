package com.dental_stack.exception.drive;

/** Exception thrown when Drive file upload operations fail. */
public class DriveUploadException extends DriveOperationException {

    private static final String ERROR_CODE = "DRIVE_UPLOAD_ERROR";

    public DriveUploadException(String message) {
        super(ERROR_CODE, message);
    }

    public DriveUploadException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public DriveUploadException(String fileName, String path, Long profileId, Throwable cause) {
        super(
                ERROR_CODE,
                String.format(
                        "Failed to upload file to Drive | fileName=%s | path=%s | profileId=%d",
                        fileName, path, profileId),
                cause);
    }
}
