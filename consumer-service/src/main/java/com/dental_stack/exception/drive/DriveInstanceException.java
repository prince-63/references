package com.dental_stack.exception.drive;

/** Exception thrown when Drive instance creation or retrieval fails. */
public class DriveInstanceException extends DriveOperationException {

    private static final String ERROR_CODE = "DRIVE_INSTANCE_ERROR";

    public DriveInstanceException(String message) {
        super(ERROR_CODE, message);
    }

    public DriveInstanceException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public DriveInstanceException(Long profileId, Throwable cause) {
        super(
                ERROR_CODE,
                String.format("Failed to get Drive instance for profileId=%d", profileId),
                cause);
    }
}
