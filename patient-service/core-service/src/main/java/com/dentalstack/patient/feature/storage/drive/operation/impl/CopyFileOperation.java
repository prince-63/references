package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.config.RetryExecutor;
import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.CopyContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import java.util.Collections;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CopyFileOperation extends AbstractDriveOperation<CopyContext, String> {

    private final RetryExecutor retryExecutor;

    public CopyFileOperation(OptimizedDrivePathResolver pathResolver, RetryExecutor retryExecutor) {
        super(pathResolver);
        this.retryExecutor = retryExecutor;
    }

    @Override
    public void validate(CopyContext context) {
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
    protected String doExecute(Drive drive, CopyContext context) throws Exception {
        String srcFileId =
                pathResolver.resolvePath(drive, context.getProfileId(), context.getSourcePath(), false, false);
        if (srcFileId == null) {
            throw new IllegalArgumentException("Source file not found: " + context.getSourcePath());
        }

        String destParentId =
                pathResolver.getParentFolderIdOptimized(drive, context.getProfileId(), context.getDestinationPath());
        String destFileName = pathResolver.getFileNameFromPath(context.getDestinationPath());

        File copiedMetadata = new File();
        copiedMetadata.setName(destFileName);

        if (destParentId != null) {
            copiedMetadata.setParents(Collections.singletonList(destParentId));
        }

        File copiedFile = retryExecutor.execute("Copy file: " + context.getSourcePath(), () -> drive.files()
                .copy(srcFileId, copiedMetadata)
                .setFields("id, name, webViewLink, webContentLink")
                .execute());

        return copiedFile.getWebViewLink();
    }

    @Override
    protected void logSuccess(CopyContext context, String result) {
        log.info("File copied from {} to {}", context.getSourcePath(), context.getDestinationPath());
    }

    @Override
    protected void logError(CopyContext context, Exception error) {
        log.error(
                "Failed to copy file from {} to {}: {}",
                context.getSourcePath(),
                context.getDestinationPath(),
                error.getMessage());
    }
}
