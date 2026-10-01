package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.config.RetryExecutor;
import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.DownloadContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GetFileOperation extends AbstractDriveOperation<DownloadContext, FileContent> {

    private final RetryExecutor retryExecutor;

    public GetFileOperation(OptimizedDrivePathResolver pathResolver, RetryExecutor retryExecutor) {
        super(pathResolver);
        this.retryExecutor = retryExecutor;
    }

    @Override
    public void validate(DownloadContext context) {
        super.validate(context);
        if (context.getPath() == null || context.getPath().trim().isEmpty()) {
            throw new IllegalArgumentException("Path cannot be null or empty");
        }
        if (context.getProfileId() == null) {
            throw new IllegalArgumentException("ProfileId cannot be null");
        }
    }

    @Override
    protected FileContent doExecute(Drive drive, DownloadContext context) throws Exception {
        String fileId = pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), false, false);

        if (fileId == null) {
            throw new IllegalArgumentException("File not found: " + context.getPath());
        }

        final String resolvedFileId = fileId;
        return retryExecutor.execute("Get file: " + context.getPath(), () -> {
            File fileMetadata = drive.files()
                    .get(resolvedFileId)
                    .setFields("id, name, mimeType, size, webViewLink, webContentLink")
                    .execute();

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            drive.files().get(resolvedFileId).executeMediaAndDownloadTo(outputStream);

            String base64Content = Base64.getEncoder().encodeToString(outputStream.toByteArray());

            return new FileContent(
                    fileMetadata.getId(),
                    fileMetadata.getName(),
                    fileMetadata.getMimeType(),
                    fileMetadata.getSize(),
                    fileMetadata.getWebViewLink(),
                    fileMetadata.getWebContentLink(),
                    base64Content);
        });
    }

    @Override
    protected void logSuccess(DownloadContext context, FileContent content) {
        log.info("Successfully retrieved file from path {}", context.getPath());
    }

    @Override
    protected void logError(DownloadContext context, Exception error) {
        log.error("Failed to get file from path {}: {}", context.getPath(), error.getMessage());
    }
}
