package com.dental_stack.files.migration.services;

import com.dental_stack.exception.drive.DrivePermissionException;
import com.dental_stack.exception.drive.DriveUploadException;
import com.dental_stack.files.migration.dto.UploadContext;
import com.dental_stack.files.migration.dto.UploadedChunkContext;
import com.dental_stack.files.migration.utils.DrivePathResolver;
import com.google.api.client.googleapis.media.MediaHttpUploader;
import com.google.api.client.http.InputStreamContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveRequest;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import com.google.api.services.drive.model.PermissionList;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
public class DriveService {

    @Autowired private DrivePathResolver pathResolver;
    private static final long RESUMABLE_UPLOAD_THRESHOLD = 5 * 1024 * 1024;
    private static final int MAX_CONCURRENT_UPLOADS = 3;
    private static final int RESUMABLE_CHUNK_SIZE = 10 * 1024 * 1024;
    private static final String MINIMAL_FIELDS = "id,name,webViewLink,webContentLink,thumbnailLink";
    private boolean setPublicPermission = true;
    @Setter private boolean checkExistingFile = false;

    public void setPublicPermission(boolean setPublicPermission) {
        this.setPublicPermission = setPublicPermission;
    }

    public UploadedChunkContext uploadFile(Drive drive, UploadContext context) {
        try {
            String parentFolderId =
                    pathResolver.getParentFolderIdOptimized(
                            drive, context.getProfileId(), context.getPath());

            String fileName = pathResolver.getFileNameFromPath(context.getPath());
            if (fileName.isEmpty() && context.getFile().getOriginalFilename() != null) {
                fileName = context.getFile().getOriginalFilename();
            }

            if (checkExistingFile) {
                deleteExistingFile(drive, context);
            }

            File fileMetadata = createFileMetadata(fileName, parentFolderId);
            File uploadedFile = uploadFileStreaming(drive, fileMetadata, context);

            if (setPublicPermission) {
                setPublicReadPermission(drive, uploadedFile.getId());
            }

            return UploadedChunkContext.builder()
                    .driveFileId(uploadedFile.getId())
                    .url(uploadedFile.getWebViewLink())
                    .downloadUrl(uploadedFile.getWebContentLink())
                    .thumbnailUrl(uploadedFile.getThumbnailLink())
                    .build();
        } catch (Exception e) {
            String fileName = context.getFile().getOriginalFilename();
            throw new DriveUploadException(fileName, context.getPath(), context.getProfileId(), e);
        }
    }

    public void shareFileAndFolder(Drive drive, Long profileId, String path, String email) {
        try {
            String fileId = pathResolver.resolvePath(drive, profileId, path, true, false);
            if (fileId == null) {
                return;
            }

            Permission permission =
                    new Permission().setType("user").setRole("reader").setEmailAddress(email);

            drive.permissions().create(fileId, permission).setSendNotificationEmail(true).execute();

            log.info("Shared file/folder {} with user {} with role {}", fileId, email, "reader");
        } catch (Exception e) {
            throw new DrivePermissionException(path, email, e);
        }
    }

    public void unShareFileAndFolder(Drive drive, String driveFileId, String email)
            throws IOException {
        if (driveFileId == null) {
            return;
        }
        PermissionList permissionList =
                drive.permissions()
                        .list(driveFileId)
                        .setFields("permissions(id,emailAddress,role)")
                        .execute();
        if (permissionList.getPermissions() == null) {
            return;
        }
        for (Permission permission : permissionList.getPermissions()) {
            if ("owner".equals(permission.getRole())) {
                continue;
            }
            if (email.equalsIgnoreCase(permission.getEmailAddress())) {
                drive.permissions().delete(driveFileId, permission.getId()).execute();
                return;
            }
        }

        log.info(
                "Un Shared file/folder {} with user {} with role {}", driveFileId, email, "reader");
    }

    private record UploadResult(String fileName, File file, boolean error) {}

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
                drive.permissions()
                        .create(fileId, permission)
                        .setFields("id") // Minimal response to reduce network overhead
                        .execute();
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

    private File uploadFileStreaming(Drive drive, File fileMetadata, MultipartFile file)
            throws IOException {
        long fileSize = file.getSize();
        if (fileSize > RESUMABLE_UPLOAD_THRESHOLD) {
            return uploadLargeFileResumable(drive, fileMetadata, file, fileSize);
        } else {
            return uploadSmallFileStreaming(drive, fileMetadata, file, fileSize);
        }
    }

    private File uploadSmallFileStreaming(
            Drive drive, File fileMetadata, MultipartFile file, long fileSize) throws IOException {
        String contentType =
                file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        InputStreamContent mediaContent =
                new InputStreamContent(contentType, file.getInputStream());
        mediaContent.setLength(fileSize);

        DriveRequest<File> request =
                drive.files().create(fileMetadata, mediaContent).setFields(MINIMAL_FIELDS);

        request.setDisableGZipContent(true);

        return request.execute();
    }

    private File uploadLargeFileResumable(
            Drive drive, File fileMetadata, MultipartFile file, long fileSize) throws IOException {
        String contentType =
                file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        InputStreamContent mediaContent =
                new InputStreamContent(contentType, file.getInputStream());
        mediaContent.setLength(fileSize);
        mediaContent.setCloseInputStream(true);

        Drive.Files.Create request =
                drive.files().create(fileMetadata, mediaContent).setFields(MINIMAL_FIELDS);

        MediaHttpUploader uploader = request.getMediaHttpUploader();
        uploader.setDirectUploadEnabled(false);
        uploader.setChunkSize(RESUMABLE_CHUNK_SIZE);

        return request.execute();
    }

    private File uploadFileStreaming(Drive drive, File fileMetadata, UploadContext context)
            throws IOException {
        return uploadFileStreaming(drive, fileMetadata, context.getFile());
    }

    private void setPublicReadPermission(Drive drive, String fileId) throws Exception {
        Permission anyonePermission =
                new Permission().setType("anyone").setRole("reader").setAllowFileDiscovery(false);

        drive.permissions().create(fileId, anyonePermission).setFields("id").execute();
    }

    private void deleteExistingFile(Drive drive, UploadContext context) throws Exception {
        try {
            String existingFileId =
                    pathResolver.resolvePathOptimized(
                            drive, context.getProfileId(), context.getPath(), false, false);

            if (existingFileId != null) {
                log.info(
                        "File already exists at path: {}, deleting old version", context.getPath());
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
}
