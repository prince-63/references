package com.dental_stack.exception.file;

/** Exception thrown when file move operations fail. */
public class FileMoveException extends FileOperationException {

    private static final String ERROR_CODE = "FILE_MOVE_ERROR";

    public FileMoveException(String message) {
        super(ERROR_CODE, message);
    }

    public FileMoveException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public FileMoveException(Long profileId, int fileCount, Throwable cause) {
        super(
                ERROR_CODE,
                String.format(
                        "Failed to move files | profileId=%d | fileCount=%d", profileId, fileCount),
                cause);
    }
}
