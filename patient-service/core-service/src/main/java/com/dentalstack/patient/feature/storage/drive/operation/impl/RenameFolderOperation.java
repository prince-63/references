package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.config.RetryExecutor;
import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.RenameFolderContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.dentalstack.patient.feature.storage.s3.AmazonS3ServiceImpl.RenamedFileDetails;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RenameFolderOperation
        extends AbstractDriveOperation<RenameFolderContext, Map<String, RenamedFileDetails>> {

    private static final String FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
    private final RetryExecutor retryExecutor;

    public RenameFolderOperation(OptimizedDrivePathResolver pathResolver, RetryExecutor retryExecutor) {
        super(pathResolver);
        this.retryExecutor = retryExecutor;
    }

    @Override
    public void validate(RenameFolderContext context) {
        super.validate(context);
        if (context.getPath() == null || context.getPath().trim().isEmpty()) {
            throw new IllegalArgumentException("Path cannot be null or empty");
        }
        if (context.getNewName() == null || context.getNewName().trim().isEmpty()) {
            throw new IllegalArgumentException("New name cannot be null or empty");
        }
        if (context.getProfileId() == null) {
            throw new IllegalArgumentException("ProfileId cannot be null");
        }
    }

    @Override
    protected Map<String, RenamedFileDetails> doExecute(Drive drive, RenameFolderContext context) throws Exception {
        String folderId = pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), true, false);
        if (folderId == null) {
            throw new IllegalArgumentException("Folder not found: " + context.getPath());
        }

        String newFolderPath = calculateNewFolderPath(context.getPath(), context.getNewName());
        Map<String, String> fileIdToOldPath = buildPathMap(drive, folderId, context.getPath());

        File renamedFolder = renameFolder(drive, folderId, context.getNewName());

        return buildResultMap(drive, fileIdToOldPath, context.getPath(), newFolderPath, folderId, renamedFolder);
    }

    private String calculateNewFolderPath(String oldPath, String newName) {
        if (oldPath.contains("/")) {
            String parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
            return parentPath + "/" + newName;
        }
        return newName;
    }

    private File renameFolder(Drive drive, String folderId, String newName) throws Exception {
        File folderMetadata = new File();
        folderMetadata.setName(newName);
        return retryExecutor.execute("Rename folder: " + folderId, () -> drive.files()
                .update(folderId, folderMetadata)
                .setFields("id, name, webViewLink")
                .execute());
    }

    private Map<String, String> buildPathMap(Drive drive, String folderId, String currentPath) throws Exception {
        Map<String, String> fileIdToPath = new HashMap<>();
        buildPathMapRecursively(drive, folderId, currentPath, fileIdToPath);
        return fileIdToPath;
    }

    private void buildPathMapRecursively(
            Drive drive, String folderId, String currentPath, Map<String, String> fileIdToPath) throws Exception {
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
                    String filePath = currentPath + "/" + file.getName();
                    fileIdToPath.put(file.getId(), filePath);

                    if (FOLDER_MIME_TYPE.equals(file.getMimeType())) {
                        buildPathMapRecursively(drive, file.getId(), filePath, fileIdToPath);
                    }
                }
            }

            pageToken = result.getNextPageToken();
        } while (pageToken != null);
    }

    private Map<String, RenamedFileDetails> buildResultMap(
            Drive drive,
            Map<String, String> fileIdToOldPath,
            String oldFolderPath,
            String newFolderPath,
            String folderId,
            File renamedFolder)
            throws Exception {

        Map<String, RenamedFileDetails> result = new HashMap<>();

        for (Map.Entry<String, String> entry : fileIdToOldPath.entrySet()) {
            String fileId = entry.getKey();
            String oldPath = entry.getValue();
            String relativePath = oldPath.substring(oldFolderPath.length());
            String newPath = newFolderPath + relativePath;

            File file = drive.files().get(fileId).setFields("webViewLink").execute();
            result.put(oldPath, new RenamedFileDetails(oldPath, newPath, file.getWebViewLink()));
        }

        result.put(oldFolderPath, new RenamedFileDetails(oldFolderPath, newFolderPath, renamedFolder.getWebViewLink()));

        return result;
    }

    @Override
    protected void logSuccess(RenameFolderContext context, Map<String, RenamedFileDetails> result) {
        log.info(
                "Folder renamed from {} to {} ({} files affected)",
                context.getPath(),
                context.getNewName(),
                result.size());
    }

    @Override
    protected void logError(RenameFolderContext context, Exception error) {
        log.error(
                "Failed to rename folder from {} to {}: {}",
                context.getPath(),
                context.getNewName(),
                error.getMessage());
    }
}
