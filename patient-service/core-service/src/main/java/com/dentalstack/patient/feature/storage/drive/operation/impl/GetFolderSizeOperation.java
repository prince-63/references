package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.config.RetryExecutor;
import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.FolderContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GetFolderSizeOperation extends AbstractDriveOperation<FolderContext, Double> {

    private static final String FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
    private final RetryExecutor retryExecutor;

    public GetFolderSizeOperation(OptimizedDrivePathResolver pathResolver, RetryExecutor retryExecutor) {
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
    protected Double doExecute(Drive drive, FolderContext context) throws Exception {
        String folderId = pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), true, false);
        if (folderId == null) {
            throw new IllegalArgumentException("Folder not found: " + context.getPath());
        }

        long totalSizeInBytes = calculateFolderSize(drive, folderId);
        return totalSizeInBytes / (1024.0 * 1024.0);
    }

    private long calculateFolderSize(Drive drive, String folderId) throws Exception {
        long totalSize = 0;
        String pageToken = null;

        do {
            String query = "'" + folderId + "' in parents and trashed=false";
            final String currentPageToken = pageToken;

            FileList result = retryExecutor.execute("List folder contents for size: " + folderId, () -> drive.files()
                    .list()
                    .setQ(query)
                    .setFields("nextPageToken, files(id, mimeType, size)")
                    .setPageToken(currentPageToken)
                    .execute());

            List<File> files = result.getFiles();
            if (files != null) {
                for (File file : files) {
                    if (FOLDER_MIME_TYPE.equals(file.getMimeType())) {
                        totalSize += calculateFolderSize(drive, file.getId());
                    } else if (file.getSize() != null) {
                        totalSize += file.getSize();
                    }
                }
            }

            pageToken = result.getNextPageToken();
        } while (pageToken != null);

        return totalSize;
    }

    @Override
    protected void logSuccess(FolderContext context, Double result) {
        log.info("Folder size calculated for path: {} = {} MB", context.getPath(), result);
    }

    @Override
    protected void logError(FolderContext context, Exception error) {
        log.error("Failed to calculate folder size for path {}: {}", context.getPath(), error.getMessage());
    }
}
