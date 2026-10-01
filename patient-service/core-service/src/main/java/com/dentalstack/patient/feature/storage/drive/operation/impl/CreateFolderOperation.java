package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.config.RetryExecutor;
import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.FolderContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.google.api.services.drive.Drive;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CreateFolderOperation extends AbstractDriveOperation<FolderContext, String> {

    private final RetryExecutor retryExecutor;

    public CreateFolderOperation(OptimizedDrivePathResolver pathResolver, RetryExecutor retryExecutor) {
        super(pathResolver);
        this.retryExecutor = retryExecutor;
    }

    @Override
    public void validate(FolderContext context) {
        super.validate(context);
        if (context.getPath() == null || context.getPath().trim().isEmpty()) {
            throw new IllegalArgumentException("Path cannot be null or empty");
        }
        if (context.getProfileId() == null) {
            throw new IllegalArgumentException("ProfileId cannot be null");
        }
    }

    @Override
    protected String doExecute(Drive drive, FolderContext context) throws Exception {
        return retryExecutor.execute(
                "Create folder: " + context.getPath(),
                () -> pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), true, true));
    }

    @Override
    protected void logSuccess(FolderContext context, String result) {
        log.info("Folder created at path: {}", context.getPath());
    }

    @Override
    protected void logError(FolderContext context, Exception error) {
        log.error("Failed to create folder at path {}: {}", context.getPath(), error.getMessage());
    }
}
