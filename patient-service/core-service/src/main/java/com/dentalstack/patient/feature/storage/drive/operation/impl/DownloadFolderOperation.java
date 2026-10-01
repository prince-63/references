package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.config.RetryExecutor;
import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.DownloadFolderContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DownloadFolderOperation extends AbstractDriveOperation<DownloadFolderContext, byte[]> {

    private static final String FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
    private static final int MAX_CONCURRENT_DOWNLOADS = 4;

    private final RetryExecutor retryExecutor;

    public DownloadFolderOperation(OptimizedDrivePathResolver pathResolver, RetryExecutor retryExecutor) {
        super(pathResolver);
        this.retryExecutor = retryExecutor;
    }

    @Override
    public void validate(DownloadFolderContext context) {
        super.validate(context);
        if (context.getPath() == null || context.getPath().trim().isEmpty()) {
            throw new IllegalArgumentException("Path cannot be null or empty");
        }
        if (context.getZipName() == null || context.getZipName().trim().isEmpty()) {
            throw new IllegalArgumentException("Zip name cannot be null or empty");
        }
        if (context.getProfileId() == null) {
            throw new IllegalArgumentException("ProfileId cannot be null");
        }
    }

    @Override
    protected byte[] doExecute(Drive drive, DownloadFolderContext context) throws Exception {
        try {
            String folderId;
            if (context.getDriveFileId() != null) {
                folderId = context.getDriveFileId();
            } else {

                folderId = pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), true, false);
                if (folderId == null) {
                    throw new IllegalArgumentException("Folder not found: " + context.getPath());
                }
            }

            List<FileEntry> fileEntries = new ArrayList<>();
            collectFileEntries(drive, folderId, "", fileEntries);

            Map<String, byte[]> fileContents = downloadFilesInParallel(drive, fileEntries);

            return createZipFile(fileContents, context.getZipName());
        } catch (FileNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new FileNotFoundException("File not found: " + e.getLocalizedMessage());
        }
    }

    private record FileEntry(String fileId, String relativePath) {}

    private void collectFileEntries(Drive drive, String folderId, String currentPath, List<FileEntry> fileEntries)
            throws Exception {
        String pageToken = null;

        do {
            String query = "'" + folderId + "' in parents and trashed=false";

            FileList result = drive.files()
                    .list()
                    .setQ(query)
                    .setFields("nextPageToken, files(id, name, mimeType)")
                    .setPageToken(pageToken)
                    .execute();

            List<File> files = result.getFiles();
            if (files != null) {
                for (File file : files) {
                    String relativePath = currentPath.isEmpty() ? file.getName() : currentPath + "/" + file.getName();

                    if (FOLDER_MIME_TYPE.equals(file.getMimeType())) {
                        collectFileEntries(drive, file.getId(), relativePath, fileEntries);
                    } else {
                        fileEntries.add(new FileEntry(file.getId(), relativePath));
                    }
                }
            }

            pageToken = result.getNextPageToken();
        } while (pageToken != null);
    }

    private Map<String, byte[]> downloadFilesInParallel(Drive drive, List<FileEntry> fileEntries) {
        Map<String, byte[]> fileContents = new ConcurrentHashMap<>();

        if (fileEntries.isEmpty()) {
            return fileContents;
        }

        if (fileEntries.size() <= 2) {
            for (FileEntry entry : fileEntries) {
                downloadFileWithRetry(drive, entry.fileId(), entry.relativePath(), fileContents);
            }
            return fileContents;
        }

        ExecutorService executor = Executors.newFixedThreadPool(Math.min(MAX_CONCURRENT_DOWNLOADS, fileEntries.size()));
        List<Future<?>> futures = new ArrayList<>();

        for (FileEntry entry : fileEntries) {
            futures.add(executor.submit(
                    () -> downloadFileWithRetry(drive, entry.fileId(), entry.relativePath(), fileContents)));
        }

        for (Future<?> future : futures) {
            try {
                future.get(120, TimeUnit.SECONDS);
            } catch (Exception e) {
                log.warn("File download task failed or timed out", e);
            }
        }

        executor.shutdown();
        try {
            if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }

        return fileContents;
    }

    private void downloadFileWithRetry(
            Drive drive, String fileId, String relativePath, Map<String, byte[]> fileContents) {
        try {
            byte[] data = retryExecutor.execute("Download folder file: " + relativePath, () -> {
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                drive.files().get(fileId).executeMediaAndDownloadTo(outputStream);
                return outputStream.toByteArray();
            });
            fileContents.put(relativePath, data);
        } catch (Exception e) {
            log.warn("Failed to download file: {} in folder download after retries", relativePath, e);
        }
    }

    private byte[] createZipFile(Map<String, byte[]> fileContents, String zipName) throws Exception {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (Map.Entry<String, byte[]> entry : fileContents.entrySet()) {
                String relativePath = zipName + "/" + entry.getKey();
                ZipEntry zipEntry = new ZipEntry(relativePath);
                zos.putNextEntry(zipEntry);
                zos.write(entry.getValue());
                zos.closeEntry();
            }

            zos.finish();
            return baos.toByteArray();
        }
    }

    @Override
    protected void logSuccess(DownloadFolderContext context, byte[] result) {
        log.info("Folder downloaded and zipped from path: {} ({} bytes)", context.getPath(), result.length);
    }

    @Override
    protected void logError(DownloadFolderContext context, Exception error) {
        log.error("Failed to download folder from path {}: {}", context.getPath(), error.getMessage());
    }
}
