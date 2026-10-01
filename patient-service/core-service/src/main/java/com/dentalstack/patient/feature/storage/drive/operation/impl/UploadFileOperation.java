package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.config.RetryExecutor;
import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.UploadContext;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.UploadedChunkContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.google.api.client.http.InputStreamContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import java.util.Collections;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UploadFileOperation extends AbstractDriveOperation<UploadContext, UploadedChunkContext> {

    private final RetryExecutor retryExecutor;

    public UploadFileOperation(OptimizedDrivePathResolver pathResolver, RetryExecutor retryExecutor) {
        super(pathResolver);
        this.retryExecutor = retryExecutor;
    }

    @Override
    public void validate(UploadContext context) {
        super.validate(context);
        if (context.getFile() == null || context.getFile().isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }
        if (context.getPath() == null || context.getPath().trim().isEmpty()) {
            throw new IllegalArgumentException("Path cannot be null or empty");
        }
        if (context.getProfileId() == null) {
            throw new IllegalArgumentException("ProfileId cannot be null");
        }
    }

    @Override
    protected UploadedChunkContext doExecute(Drive drive, UploadContext context) throws Exception {
        String parentFolderId =
                pathResolver.getParentFolderIdOptimized(drive, context.getProfileId(), context.getPath());
        String fileName = pathResolver.getFileNameFromPath(context.getPath());

        if (fileName.isEmpty() && context.getFile().getOriginalFilename() != null) {
            fileName = context.getFile().getOriginalFilename();
        }

        deleteExistingFile(drive, context);

        File fileMetadata = createFileMetadata(fileName, parentFolderId);

        File uploadedFile = retryExecutor.execute("Upload file: " + fileName, () -> {
            String contentType = context.getFile().getContentType() != null
                    ? context.getFile().getContentType()
                    : "application/octet-stream";

            InputStreamContent mediaContent =
                    new InputStreamContent(contentType, context.getFile().getInputStream());
            mediaContent.setLength(context.getFile().getSize());

            Drive.Files.Create createRequest = drive.files()
                    .create(fileMetadata, mediaContent)
                    .setFields("id, name, webViewLink, webContentLink, mimeType, size, thumbnailLink");

            if (context.getFile().getSize() > 5 * 1024 * 1024) {
                createRequest
                        .getMediaHttpUploader()
                        .setDirectUploadEnabled(false)
                        .setChunkSize(10 * 1024 * 1024);
            }

            return createRequest.execute();
        });

        return UploadedChunkContext.builder()
                .driveFileId(uploadedFile.getId())
                .url(uploadedFile.getWebViewLink())
                .downloadUrl(uploadedFile.getWebContentLink())
                .thumbnailUrl(uploadedFile.getThumbnailLink())
                .build();
    }

    private void deleteExistingFile(Drive drive, UploadContext context) throws Exception {
        String existingFileId =
                pathResolver.resolvePathOptimized(drive, context.getProfileId(), context.getPath(), false, false);

        if (existingFileId != null) {
            log.info("File already exists at path: {}, deleting old version", context.getPath());
            drive.files().delete(existingFileId).execute();
        }
    }

    private File createFileMetadata(String fileName, String parentFolderId) {
        File fileMetadata = new File();
        fileMetadata.setName(fileName);

        if (parentFolderId != null) {
            fileMetadata.setParents(Collections.singletonList(parentFolderId));
        }

        return fileMetadata;
    }

    @Override
    protected void logError(UploadContext context, Exception error) {
        log.error(
                "Failed to upload file {} to path {}: {}",
                context.getFile().getOriginalFilename(),
                context.getPath(),
                error.getMessage());
    }
}
