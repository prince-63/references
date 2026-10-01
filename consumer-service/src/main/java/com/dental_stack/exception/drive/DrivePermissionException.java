package com.dental_stack.exception.drive;

/** Exception thrown when Drive permission operations fail. */
public class DrivePermissionException extends DriveOperationException {

    private static final String ERROR_CODE = "DRIVE_PERMISSION_ERROR";

    public DrivePermissionException(String message) {
        super(ERROR_CODE, message);
    }

    public DrivePermissionException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public DrivePermissionException(String driveFileId, String email, Throwable cause) {
        super(
                ERROR_CODE,
                String.format(
                        "Failed to manage permissions for Drive file | driveFileId=%s | email=%s",
                        driveFileId, email),
                cause);
    }
}
