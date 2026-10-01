package com.dental_stack.exception.file;

/** Exception thrown when folder migration operations fail. */
public class FolderMigrationException extends FileOperationException {

    private static final String ERROR_CODE = "FOLDER_MIGRATION_ERROR";

    public FolderMigrationException(String message) {
        super(ERROR_CODE, message);
    }

    public FolderMigrationException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public FolderMigrationException(Long fileId, String name, String path, Long profileId) {
        super(
                ERROR_CODE,
                String.format(
                        "Failed to migrate folder | fileId=%d | name=%s | path=%s | profileId=%d",
                        fileId, name, path, profileId));
    }

    public FolderMigrationException(
            Long fileId, String name, String path, Long profileId, Throwable cause) {
        super(
                ERROR_CODE,
                String.format(
                        "Failed to migrate folder | fileId=%d | name=%s | path=%s | profileId=%d",
                        fileId, name, path, profileId),
                cause);
    }
}
