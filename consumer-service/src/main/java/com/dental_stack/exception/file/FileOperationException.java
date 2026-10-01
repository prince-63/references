package com.dental_stack.exception.file;

import com.dental_stack.exception.BaseException;

/** Base exception for all file-related operations. */
public abstract class FileOperationException extends BaseException {

    protected FileOperationException(String errorCode, String message) {
        super(errorCode, message);
    }

    protected FileOperationException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }

    protected FileOperationException(String errorCode, String message, Object... args) {
        super(errorCode, message, args);
    }

    protected FileOperationException(
            String errorCode, String message, Throwable cause, Object... args) {
        super(errorCode, message, cause, args);
    }
}
