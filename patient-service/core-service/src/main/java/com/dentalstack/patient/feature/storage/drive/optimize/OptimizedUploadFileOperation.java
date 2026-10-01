package com.dentalstack.patient.feature.storage.drive.optimize;

import com.dentalstack.patient.feature.storage.drive.config.RetryExecutor;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.UploadContext;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.UploadedChunkContext;
import com.google.api.client.googleapis.media.MediaHttpUploader;
import com.google.api.client.http.InputStreamContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveRequest;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Component("optimizedUploadFileOperation")
public class OptimizedUploadFileOperation extends OptimizedAbstractDriveOperation<UploadContext, UploadedChunkContext> {

    private static final long RESUMABLE_UPLOAD_THRESHOLD = 5 * 1024 * 1024;
    private static final int RESUMABLE_CHUNK_SIZE = 10 * 1024 * 1024;
    private static final String MINIMAL_FIELDS = "id,name,webViewLink,webContentLink,thumbnailLink";

    private final RetryExecutor retryExecutor;
    private final Executor batchUploadExecutor;

    public OptimizedUploadFileOperation(
            OptimizedDrivePathResolver pathResolver,
            RetryExecutor retryExecutor,
            @Qualifier("batchUploadExecutor") Executor batchUploadExecutor) {
        super(pathResolver);
        this.retryExecutor = retryExecutor;
        this.batchUploadExecutor = batchUploadExecutor;
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
        return executeUpload(drive, context, false);
    }

    public UploadedChunkContext executeUpload(Drive drive, UploadContext context, boolean checkExistingFile)
            throws Exception {
        String parentFolderId =
                pathResolver.getParentFolderIdOptimized(drive, context.getProfileId(), context.getPath());

        String fileName = pathResolver.getFileNameFromPath(context.getPath());
        if (fileName.isEmpty() && context.getFile().getOriginalFilename() != null) {
            fileName = context.getFile().getOriginalFilename();
        }

        if (checkExistingFile) {
            deleteExistingFile(drive, context);
        }

        File fileMetadata = createFileMetadata(fileName, parentFolderId);
        File uploadedFile = retryExecutor.execute(
                "Upload file: " + fileMetadata.getOriginalFilename(),
                () -> uploadFileStreaming(drive, fileMetadata, context));

        return UploadedChunkContext.builder()
                .driveFileId(uploadedFile.getId())
                .url(uploadedFile.getWebViewLink())
                .downloadUrl(uploadedFile.getWebContentLink())
                .thumbnailUrl(uploadedFile.getThumbnailLink())
                .build();
    }

    public List<UploadedChunkContext> batchUpload(
            Drive drive, Long profileId, String basePath, MultipartFile[] files, boolean setPublicPermission) {
        List<UploadedChunkContext> result = new ArrayList<>();
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Files list cannot be null or empty");
        }
        if (files.length > 50) {
            throw new IllegalArgumentException("Maximum 50 files allowed per batch upload");
        }
        String normalizedBasePath = basePath.endsWith("/") ? basePath.substring(0, basePath.length() - 1) : basePath;

        String parentFolderId;
        try {
            parentFolderId = pathResolver.resolvePathOptimized(drive, profileId, normalizedBasePath, true, true);
        } catch (Exception e) {
            log.error("Failed to create base folder structure: {}", e.getMessage());
            return null;
        }

        List<CompletableFuture<BatchUploadResult>> futures = new ArrayList<>();

        for (MultipartFile file : files) {
            final String finalParentId = parentFolderId;
            CompletableFuture<BatchUploadResult> future = CompletableFuture.supplyAsync(
                    () -> {
                        String fileName = file.getOriginalFilename();
                        try {
                            File fileMetadata = createFileMetadata(fileName, finalParentId);
                            File uploadedFile = retryExecutor.execute(
                                    "Upload file: " + fileMetadata.getOriginalFilename(),
                                    () -> uploadFileStreaming(drive, fileMetadata, file));
                            return new BatchUploadResult(fileName, uploadedFile, false);
                        } catch (Exception e) {
                            return new BatchUploadResult(fileName, null, true);
                        }
                    },
                    batchUploadExecutor);
            futures.add(future);
        }

        List<String> uploadedFileIds = new ArrayList<>();
        for (CompletableFuture<BatchUploadResult> future : futures) {
            try {
                BatchUploadResult uploadResult = future.get(1200, TimeUnit.SECONDS);
                if (!uploadResult.error) {
                    File uploaded = uploadResult.file;
                    uploadedFileIds.add(uploaded.getId());

                    UploadedChunkContext ctx = UploadedChunkContext.builder()
                            .driveFileId(uploaded.getId())
                            .url(uploaded.getWebViewLink())
                            .downloadUrl(uploaded.getWebContentLink())
                            .thumbnailUrl(uploaded.getThumbnailLink())
                            .fileName(uploaded.getName())
                            .size(uploaded.getSize())
                            .build();
                    result.add(ctx);
                } else {
                    log.info("unabled to upload file -> name: " + uploadResult.fileName);
                }
            } catch (Exception e) {
                log.info("unabled to upload file -> name: " + e.getMessage());
            }
        }

        if (setPublicPermission && !uploadedFileIds.isEmpty()) {
            batchSetPermissions(drive, uploadedFileIds);
        }

        return result;
    }

    private record BatchUploadResult(String fileName, File file, boolean error) {}

    private void batchSetPermissions(Drive drive, List<String> fileIds) {
        if (fileIds == null || fileIds.isEmpty()) {
            return;
        }

        Permission permission =
                new Permission().setType("anyone").setRole("reader").setAllowFileDiscovery(false);

        int successCount = 0;
        int failureCount = 0;

        for (String fileId : fileIds) {
            try {
                drive.permissions().create(fileId, permission).setFields("id").execute();
                successCount++;
            } catch (Exception e) {
                failureCount++;
            }
        }

        if (failureCount > 0) {
            log.warn(
                    "Batch permissions: {} succeeded, {} failed out of {} total",
                    successCount,
                    failureCount,
                    fileIds.size());
        }
    }

    private File uploadFileStreaming(Drive drive, File fileMetadata, MultipartFile file) throws IOException {
        long fileSize = file.getSize();
        if (fileSize > RESUMABLE_UPLOAD_THRESHOLD) {
            return uploadLargeFileResumable(drive, fileMetadata, file, fileSize);
        } else {
            return uploadSmallFileStreaming(drive, fileMetadata, file, fileSize);
        }
    }

    private File uploadSmallFileStreaming(Drive drive, File fileMetadata, MultipartFile file, long fileSize)
            throws IOException {
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        InputStreamContent mediaContent = new InputStreamContent(contentType, file.getInputStream());
        mediaContent.setLength(fileSize);

        DriveRequest<File> request =
                drive.files().create(fileMetadata, mediaContent).setFields(MINIMAL_FIELDS);

        request.setDisableGZipContent(true);

        return request.execute();
    }

    private File uploadLargeFileResumable(Drive drive, File fileMetadata, MultipartFile file, long fileSize)
            throws IOException {
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        InputStreamContent mediaContent = new InputStreamContent(contentType, file.getInputStream());
        mediaContent.setLength(fileSize);
        mediaContent.setCloseInputStream(true);

        Drive.Files.Create request =
                drive.files().create(fileMetadata, mediaContent).setFields(MINIMAL_FIELDS);

        MediaHttpUploader uploader = request.getMediaHttpUploader();
        uploader.setDirectUploadEnabled(false);
        uploader.setChunkSize(RESUMABLE_CHUNK_SIZE);

        return request.execute();
    }

    private File uploadFileStreaming(Drive drive, File fileMetadata, UploadContext context) throws IOException {
        return uploadFileStreaming(drive, fileMetadata, context.getFile());
    }

    private void deleteExistingFile(Drive drive, UploadContext context) throws Exception {
        try {
            String existingFileId =
                    pathResolver.resolvePathOptimized(drive, context.getProfileId(), context.getPath(), false, false);

            if (existingFileId != null) {
                log.info("File already exists at path: {}, deleting old version", context.getPath());
                drive.files().delete(existingFileId).execute();
            }
        } catch (Exception e) {
            log.debug("No existing file to delete: {}", e.getMessage());
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
                "Upload failed: {} to {}: {}",
                context.getFile().getOriginalFilename(),
                context.getPath(),
                error.getMessage());
    }

    @Override
    protected void logSuccess(UploadContext context, UploadedChunkContext result) {
        if (log.isDebugEnabled()) {
            log.debug(
                    "Uploaded: {} -> {} (ID: {})",
                    context.getFile().getOriginalFilename(),
                    context.getPath(),
                    result.getDriveFileId());
        }
    }
}
