package com.dental_stack.files.common.services;

import com.dental_stack.files.common.repository.FileRepository;
import com.dental_stack.files.migration.dto.UploadContext;
import com.dental_stack.files.migration.dto.UploadedChunkContext;
import com.dental_stack.files.migration.projections.LoadFileMatadata;
import com.dental_stack.files.migration.services.DriveService;
import com.dental_stack.files.migration.utils.ByteArrayMultipartFile;
import com.dental_stack.files.migration.utils.DrivePathResolver;
import com.dental_stack.files.migration.utils.IDGenerator;
import com.dental_stack.files.migration.utils.MigrationHelper;
import com.dental_stack.files.move_file.projections.FilePathView;
import com.google.api.services.drive.Drive;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
public class FileService {

    @Autowired private FileRepository fileRepository;

    @Autowired private DrivePathResolver pathResolver;

    @Autowired private MigrationHelper migrationHelper;

    @Autowired private AwsService awsService;

    @Autowired private DriveService driveService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void migrateFile(Long profileId, Drive drive, LoadFileMatadata fileMatadata) {
        byte[] content = awsService.downloadFile(fileMatadata.getFullPath());
        if (content == null || content.length == 0) {
            return;
        }
        String mimeType = migrationHelper.getMimeTypeFromFile(fileMatadata.getExtension());
        MultipartFile multipartFile =
                ByteArrayMultipartFile.create(fileMatadata.getName(), mimeType, content);

        String filePath = migrationHelper.getNewPath(fileMatadata.getFullPath());
        String[] parts = filePath.split("/");
        String newPath =
                filePath.substring(0, fileMatadata.getFullPath().lastIndexOf('/') + 1)
                        + IDGenerator.generateDriveStyleId()
                        + "_"
                        + parts[parts.length - 1];
        UploadedChunkContext uploadedContext =
                driveService.uploadFile(
                        drive,
                        UploadContext.builder()
                                .profileId(profileId)
                                .path(newPath)
                                .file(multipartFile)
                                .build());
        fileRepository.updateFileMetadata(
                fileMatadata.getFileId(),
                uploadedContext.getDriveFileId(),
                uploadedContext.getUrl(),
                newPath,
                uploadedContext.getDownloadUrl(),
                uploadedContext.getThumbnailUrl());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void migrateFolder(Long profileId, Drive drive, LoadFileMatadata fileMatadata) {
        try {
            String folderPath = migrationHelper.getNewPath(fileMatadata.getFullPath());
            if (folderPath == null || folderPath.isBlank()) {
                throw new IllegalArgumentException("Resolved folder path is empty");
            }

            String driveFileId =
                    pathResolver.resolvePath(drive, profileId, folderPath + "/", true, true);
            if (driveFileId == null || driveFileId.isBlank()) {
                throw new IllegalStateException("Unable to resolve drive folder id");
            }

            fileRepository.updateFolderMetadata(fileMatadata.getFileId(), driveFileId, folderPath);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to migrate folder: " + fileMatadata.getFullPath(), e);
        }
    }

    @Transactional
    public void moveFile(Long profileId, List<Long> fileIds) {
        List<FilePathView> files = fileRepository.findFileFullPathById(fileIds);
        for (FilePathView file : files) {
            String oldPath = file.getFullPath();
            boolean isFolder = Boolean.TRUE.equals(file.getFolder());
            String newPath = getNewPath(oldPath);
            if (isFolder) {
                awsService.moveFolderPrefix(oldPath, newPath);
                fileRepository.updateMovedFile(oldPath, newPath, null);
            } else {
                String url = awsService.moveFile(oldPath, newPath);
                fileRepository.updateMovedFile(oldPath, newPath, url);
            }
        }
    }

    private String getNewPath(String oldPath) {
        if (oldPath == null || !oldPath.startsWith("patient/")) {
            return oldPath;
        }

        int firstSlashAfterPatient = oldPath.indexOf('/', "patient/".length());
        if (firstSlashAfterPatient == -1) {
            return oldPath;
        }

        String patientFolder = oldPath.substring("patient/".length(), firstSlashAfterPatient);
        String remainingPath = oldPath.substring(firstSlashAfterPatient);

        String[] parts = patientFolder.split("_");

        if (parts.length >= 3) {
            String newFolder = parts[0] + "_" + parts[1];
            return "patient/" + newFolder + remainingPath;
        }

        return oldPath;
    }
}
