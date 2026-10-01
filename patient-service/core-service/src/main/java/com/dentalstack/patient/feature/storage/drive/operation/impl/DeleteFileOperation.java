package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.config.RetryExecutor;
import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.DeleteContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.google.api.services.drive.Drive;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DeleteFileOperation extends AbstractDriveOperation<DeleteContext, Void> {

    private final RetryExecutor retryExecutor;
    private final FileRepository fileRepository;

    public DeleteFileOperation(
            OptimizedDrivePathResolver pathResolver, RetryExecutor retryExecutor, FileRepository fileRepository) {
        super(pathResolver);
        this.retryExecutor = retryExecutor;
        this.fileRepository = fileRepository;
    }

    @Override
    public void validate(DeleteContext context) {
        super.validate(context);
        if (context.getPath() == null || context.getPath().trim().isEmpty()) {
            throw new IllegalArgumentException("Path cannot be null or empty");
        }
        if (context.getProfileId() == null) {
            throw new IllegalArgumentException("ProfileId cannot be null");
        }
    }

    @Override
    protected Void doExecute(Drive drive, DeleteContext context) throws Exception {
        String fileId = resolveFileId(drive, context);

        if (fileId == null) {
            log.info("Skip delete for missing path: {}", context.getPath());
            return null;
        }

        retryExecutor.execute("Delete file: " + context.getPath(), () -> {
            drive.files().delete(fileId).execute();
            return null;
        });
        return null;
    }

    private String resolveFileId(Drive drive, DeleteContext context) throws Exception {
        Optional<String> dbFileExitsWithDriveFileId = fileRepository.findByDriveFileIdByFileFullPath(context.getPath());
        if (dbFileExitsWithDriveFileId.isPresent()) {
            return dbFileExitsWithDriveFileId.get();
        } else {
            String resolveManualFileId =
                    pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), false, false);
            if (resolveManualFileId == null) {
                resolveManualFileId =
                        pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), true, false);
            }
            return resolveManualFileId;
        }
    }

    @Override
    protected void logSuccess(DeleteContext context, Void result) {
        log.info("Deleted file/folder at path: {}", context.getPath());
    }

    @Override
    protected void logError(DeleteContext context, Exception error) {
        log.error("Failed to delete file/folder at path {}: {}", context.getPath(), error.getMessage());
    }
}
