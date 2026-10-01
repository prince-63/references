package com.dentalstack.patient.feature.storage.cleanup;

import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.Status;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class S3CleanupService {

    private final FileRepository fileRepository;
    private final AmazonS3Service amazonS3Service;

    @Value("${app.cloud.amazon.s3.bucket.files}")
    private String filesBucket;

    public void cleanupMigratedByProfileId(Long profileId) {
        List<File> migratedFiles = loadMigratedFiles(profileId);
        log.info("Found {} migrated items to cleanup from S3 for profile: {}", migratedFiles.size(), profileId);

        if (migratedFiles.isEmpty()) {
            log.info("No files to cleanup from S3 for profile: {}", profileId);
            return;
        }

        migratedFiles = sortForCleanup(migratedFiles);

        for (File file : migratedFiles) {
            deleteFromS3(file);
        }
    }

    public void cleanupMigratedFiles(Long profileId, List<File> fileList) {
        List<File> migratedFiles = fileList;
        log.info("Found {} migrated items to cleanup from S3 for profile: {}", migratedFiles.size(), profileId);

        if (migratedFiles.isEmpty()) {
            log.info("No files to cleanup from S3 for profile: {}", profileId);
            return;
        }

        migratedFiles = sortForCleanup(migratedFiles);

        for (File file : migratedFiles) {
            deleteFromS3(file);
        }
    }

    private List<File> loadMigratedFiles(Long profileId) {
        List<File> allFiles = fileRepository.findAllByProfileId(profileId);

        return allFiles.stream()
                .filter(file -> file.getStatus() == Status.ACTIVE)
                .filter(file -> file.getIsGDrivePlatform() != null && file.getIsGDrivePlatform())
                .toList();
    }

    private List<File> sortForCleanup(List<File> files) {
        return files.stream()
                .sorted(Comparator.comparing(File::isFolder)
                        .thenComparing(file -> getPathDepth(file.getFullPath()), Comparator.reverseOrder())
                        .thenComparing(File::getCreatedAt, Comparator.reverseOrder()))
                .toList();
    }

    private int getPathDepth(String path) {
        if (path == null || path.isEmpty()) {
            return 0;
        }
        return (int) path.chars().filter(ch -> ch == '/' || ch == '\\').count();
    }

    private void deleteFromS3(File file) {
        String path = file.getFullPath();

        if (file.isFolder() && !path.endsWith("/")) {
            path = path + "/";
        }

        log.debug("Deleting from S3 - Path: {}, Type: {}", path, file.isFolder() ? "Folder" : "File");

        amazonS3Service.deleteFile(filesBucket, path);

        log.info(
                "Successfully deleted {} from S3: {} (ID: {})",
                file.isFolder() ? "folder" : "file",
                file.getName(),
                file.getId());
    }
}
