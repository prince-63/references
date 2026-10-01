package com.dental_stack.exception.file;

/** Exception thrown when file migration operations fail. */
public class FileMigrationException extends FileOperationException {

    private static final String ERROR_CODE = "FILE_MIGRATION_ERROR";

    public FileMigrationException(String message) {
        super(ERROR_CODE, message);
    }

    public FileMigrationException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public FileMigrationException(Long fileId, String name, String path, Long profileId) {
        super(
                ERROR_CODE,
                String.format(
                        "Failed to migrate file | fileId=%d | name=%s | path=%s | profileId=%d",
                        fileId, name, path, profileId));
    }

    public FileMigrationException(
            Long fileId, String name, String path, Long profileId, Throwable cause) {
        super(
                ERROR_CODE,
                String.format(
                        "Failed to migrate file | fileId=%d | name=%s | path=%s | profileId=%d",
                        fileId, name, path, profileId),
                cause);
    }
}
