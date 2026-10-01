package com.dental_stack.exception.drive;

import com.dental_stack.exception.BaseException;

/** Base exception for Google Drive-related operations. */
public abstract class DriveOperationException extends BaseException {

    protected DriveOperationException(String errorCode, String message) {
        super(errorCode, message);
    }

    protected DriveOperationException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }

    protected DriveOperationException(String errorCode, String message, Object... args) {
        super(errorCode, message, args);
    }

    protected DriveOperationException(
            String errorCode, String message, Throwable cause, Object... args) {
        super(errorCode, message, cause, args);
    }
}
