package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.MoveContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.google.api.services.drive.Drive;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MoveFileOperation extends AbstractDriveOperation<MoveContext, String> {

    private final CopyFileOperation copyFileOperation;
    private final DeleteFileOperation deleteFileOperation;

    public MoveFileOperation(
            OptimizedDrivePathResolver pathResolver,
            CopyFileOperation copyFileOperation,
            DeleteFileOperation deleteFileOperation) {
        super(pathResolver);
        this.copyFileOperation = copyFileOperation;
        this.deleteFileOperation = deleteFileOperation;
    }

    @Override
    public void validate(MoveContext context) {
        super.validate(context);
        if (context.getSourcePath() == null || context.getSourcePath().trim().isEmpty()) {
            throw new IllegalArgumentException("Source path cannot be null or empty");
        }
        if (context.getDestinationPath() == null
                || context.getDestinationPath().trim().isEmpty()) {
            throw new IllegalArgumentException("Destination path cannot be null or empty");
        }
        if (context.getProfileId() == null) {
            throw new IllegalArgumentException("ProfileId cannot be null");
        }
    }

    @Override
    protected String doExecute(Drive drive, MoveContext context) throws Exception {
        String newUrl = copyFile(drive, context);

        try {
            deleteSourceFile(drive, context);
        } catch (Exception e) {
            rollback(drive, context);
            throw e;
        }

        return newUrl;
    }

    private String copyFile(Drive drive, MoveContext context) throws Exception {
        OperationContext.CopyContext copyContext = OperationContext.CopyContext.builder()
                .profileId(context.getProfileId())
                .sourcePath(context.getSourcePath())
                .destinationPath(context.getDestinationPath())
                .build();

        return copyFileOperation.execute(drive, copyContext);
    }

    private void deleteSourceFile(Drive drive, MoveContext context) throws Exception {
        OperationContext.DeleteContext deleteContext = OperationContext.DeleteContext.builder()
                .profileId(context.getProfileId())
                .path(context.getSourcePath())
                .build();

        deleteFileOperation.execute(drive, deleteContext);
    }

    private void rollback(Drive drive, MoveContext context) {
        try {
            log.warn("Rolling back move operation, deleting destination file: {}", context.getDestinationPath());

            OperationContext.DeleteContext rollbackContext = OperationContext.DeleteContext.builder()
                    .profileId(context.getProfileId())
                    .path(context.getDestinationPath())
                    .build();

            deleteFileOperation.execute(drive, rollbackContext);
            log.info("Rollback completed successfully");
        } catch (Exception rollbackException) {
            log.error("Failed to rollback move operation: {}", rollbackException.getMessage());
        }
    }

    @Override
    protected void logSuccess(MoveContext context, String result) {
        log.info("File moved from {} to {}", context.getSourcePath(), context.getDestinationPath());
    }

    @Override
    protected void logError(MoveContext context, Exception error) {
        log.error(
                "Failed to move file from {} to {}: {}",
                context.getSourcePath(),
                context.getDestinationPath(),
                error.getMessage());
    }
}
