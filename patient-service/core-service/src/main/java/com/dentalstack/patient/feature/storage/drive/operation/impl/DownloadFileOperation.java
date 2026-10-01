package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.config.RetryExecutor;
import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.DownloadContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.google.api.services.drive.Drive;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DownloadFileOperation extends AbstractDriveOperation<DownloadContext, byte[]> {

    private final RetryExecutor retryExecutor;

    public DownloadFileOperation(OptimizedDrivePathResolver pathResolver, RetryExecutor retryExecutor) {
        super(pathResolver);
        this.retryExecutor = retryExecutor;
    }

    @Override
    public void validate(DownloadContext context) {
        super.validate(context);
        if (context.getPath() == null && context.getDriveFileId() == null) {
            throw new IllegalArgumentException("Path cannot be null or empty");
        }
        if (context.getProfileId() == null) {
            throw new IllegalArgumentException("ProfileId cannot be null");
        }
    }

    @Override
    protected byte[] doExecute(Drive drive, DownloadContext context) throws Exception {
        String resolvedFileId = resolveFileId(drive, context);

        if (resolvedFileId == null) {
            throw new FileNotFoundException(
                    "File not found: " + (context.getPath() != null ? context.getPath() : context.getDriveFileId()));
        }

        return retryExecutor.execute("Download file: " + resolvedFileId, () -> {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            drive.files().get(resolvedFileId).executeMediaAndDownloadTo(outputStream);
            return outputStream.toByteArray();
        });
    }

    private String resolveFileId(Drive drive, DownloadContext context) throws Exception {
        if (context.getDriveFileId() != null) {
            return context.getDriveFileId();
        }

        return pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), false, false);
    }

    @Override
    protected void logSuccess(DownloadContext context, byte[] result) {
        log.info("Downloaded file from path: {} ({} bytes)", context.getPath(), result.length);
    }

    @Override
    protected void logError(DownloadContext context, Exception error) {
        log.error("Failed to download file from path {}: {}", context.getPath(), error.getMessage());
    }
}
