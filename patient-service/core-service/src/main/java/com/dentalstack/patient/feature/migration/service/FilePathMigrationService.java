package com.dentalstack.patient.feature.migration.service;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.drive.GDrivePlatformProvider;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.Status;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class FilePathMigrationService {

    private final FileRepository fileRepository;
    private final PatientRepository patientRepository;
    private final AmazonS3Service amazonS3Service;
    private final GoogleDriveService driveService;
    private final GDrivePlatformProvider gDrivePlatformProvider;

    @Value("${app.cloud.amazon.s3.bucket.files}")
    private String filesBucket;

    private static class FileMigrationDetails {
        Long fileId;
        String oldPath;
        String newPath;
        String oldUrl;
        String newUrl;
        boolean isGDrive;
        Long profileId;
        String driveFileId;
        Exception error;

        public FileMigrationDetails(Long fileId, String oldPath, String newPath) {
            this.fileId = fileId;
            this.oldPath = oldPath;
            this.newPath = newPath;
        }
    }

    @Transactional
    public Map<String, Object> migrateFilePathsRemoveLastName(boolean dryRun) {
        log.info("Starting file path migration. Dry run: {}", dryRun);

        Map<String, Object> result = new HashMap<>();
        List<FileMigrationDetails> successfulMigrations = new ArrayList<>();
        List<FileMigrationDetails> failedMigrations = new ArrayList<>();
        List<String> skippedPatients = new ArrayList<>();

        try {

            List<File> allFiles = fileRepository.findByStatus(Status.ACTIVE);
            log.info("Found {} active files to analyze", allFiles.size());

            Pattern patternWithLastName = Pattern.compile("patient/(\\d+)_([^_/]+)_([^_/]+)/");

            Map<Long, Patient> patientCache = new HashMap<>();

            for (File file : allFiles) {
                String fullPath = file.getFullPath();

                Matcher matcher = patternWithLastName.matcher(fullPath);

                if (matcher.find()) {
                    Long patientId = Long.parseLong(matcher.group(1));
                    String firstNameInPath = matcher.group(2);
                    String lastNameInPath = matcher.group(3);

                    Patient patient = patientCache.computeIfAbsent(
                            patientId, id -> patientRepository.findById(id).orElse(null));

                    if (patient == null) {
                        log.warn("Patient {} not found for file {}", patientId, file.getId());
                        skippedPatients.add("Patient ID: " + patientId + " (File: " + file.getId() + ")");
                        continue;
                    }

                    String newPatientFolder = patientId + "_" + patient.tagFirstName();
                    String oldPatientFolder = patientId + "_" + firstNameInPath + "_" + lastNameInPath;

                    String newPath =
                            fullPath.replace("patient/" + oldPatientFolder + "/", "patient/" + newPatientFolder + "/");

                    FileMigrationDetails migration = new FileMigrationDetails(file.getId(), fullPath, newPath);

                    boolean isGDrive = file.getIsGDrivePlatform() != null && file.getIsGDrivePlatform();
                    migration.isGDrive = isGDrive;
                    migration.profileId = file.getUserProfile() != null
                            ? file.getUserProfile().getId()
                            : null;
                    migration.driveFileId = file.getDriveFileId();
                    migration.oldUrl = file.getUrl();

                    if (!dryRun) {
                        try {

                            if (isGDrive && migration.profileId != null) {
                                migrateGDriveFile(file, migration);
                            } else {
                                migrateS3File(file, migration);
                            }

                            file.setFullPath(newPath);
                            if (migration.newUrl != null) {
                                file.setUrl(migration.newUrl);
                            }
                            fileRepository.save(file);

                            successfulMigrations.add(migration);
                            log.info("Successfully migrated file {}: {} -> {}", file.getId(), fullPath, newPath);

                        } catch (Exception e) {
                            migration.error = e;
                            failedMigrations.add(migration);
                            log.error("Failed to migrate file {}: {}", file.getId(), e.getMessage(), e);
                        }
                    } else {

                        successfulMigrations.add(migration);
                    }
                }
            }

            result.put("totalFilesAnalyzed", allFiles.size());
            result.put("filesToMigrate", successfulMigrations.size());
            result.put("successfulMigrations", successfulMigrations.size());
            result.put("failedMigrations", failedMigrations.size());
            result.put("skippedPatients", skippedPatients.size());
            result.put("dryRun", dryRun);

            if (dryRun) {
                result.put("message", "Dry run completed. No changes were made.");
                result.put(
                        "sampleMigrations",
                        successfulMigrations.stream()
                                .limit(10)
                                .map(m -> Map.of(
                                        "fileId", m.fileId,
                                        "oldPath", m.oldPath,
                                        "newPath", m.newPath,
                                        "isGDrive", m.isGDrive))
                                .toList());
            } else {
                result.put("message", "Migration completed.");
                result.put(
                        "failedMigrationDetails",
                        failedMigrations.stream()
                                .map(m -> Map.of(
                                        "fileId", m.fileId,
                                        "oldPath", m.oldPath,
                                        "newPath", m.newPath,
                                        "error", m.error != null ? m.error.getMessage() : "Unknown error"))
                                .toList());
            }

            log.info(
                    "Migration completed. Total: {}, Success: {}, Failed: {}, Skipped: {}",
                    allFiles.size(),
                    successfulMigrations.size(),
                    failedMigrations.size(),
                    skippedPatients.size());

        } catch (Exception e) {
            log.error("Migration failed with error", e);
            result.put("error", e.getMessage());
            result.put("success", false);
        }

        return result;
    }

    private void migrateGDriveFile(File file, FileMigrationDetails migration) throws Exception {}

    private void migrateS3File(File file, FileMigrationDetails migration) throws Exception {
        try {
            if (file.isFolder()) {

                String oldFolderPath = migration.oldPath.endsWith("/") ? migration.oldPath : migration.oldPath + "/";
                String newFolderPath = migration.newPath.endsWith("/") ? migration.newPath : migration.newPath + "/";

                try {
                    amazonS3Service.deleteFile(filesBucket, oldFolderPath);
                } catch (Exception e) {
                    log.warn("Failed to delete old folder marker: {}", oldFolderPath);
                }

                amazonS3Service.createFolder(filesBucket, newFolderPath);
                migration.newUrl = newFolderPath;

            } else {

                String newUrl = amazonS3Service.moveFile(filesBucket, migration.oldPath, migration.newPath);
                migration.newUrl = newUrl;
            }

        } catch (Exception e) {
            log.error("Failed to migrate S3 file {}", file.getId(), e);
            throw e;
        }
    }

    @Transactional
    public Map<String, Object> rollbackMigration(List<Long> fileIds) {
        log.info("Starting rollback for {} files", fileIds.size());

        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();

        for (Long fileId : fileIds) {
            try {
                Optional<File> fileOpt = fileRepository.findById(fileId);
                if (fileOpt.isEmpty()) {
                    errors.add("File not found: " + fileId);
                    failureCount++;
                    continue;
                }

                File file = fileOpt.get();

                log.warn("Rollback for file {} - manual intervention may be required", fileId);
                successCount++;

            } catch (Exception e) {
                errors.add("Failed to rollback file " + fileId + ": " + e.getMessage());
                failureCount++;
                log.error("Failed to rollback file {}", fileId, e);
            }
        }

        result.put("totalFiles", fileIds.size());
        result.put("successCount", successCount);
        result.put("failureCount", failureCount);
        result.put("errors", errors);

        return result;
    }

    public Map<String, Object> getMigrationStatistics() {
        Map<String, Object> stats = new HashMap<>();

        List<File> allFiles = fileRepository.findByStatus(Status.ACTIVE);
        Pattern patternWithLastName = Pattern.compile("patient/\\d+_[^_/]+_[^_/]+/");

        long filesToMigrate = allFiles.stream()
                .filter(f -> patternWithLastName.matcher(f.getFullPath()).find())
                .count();

        long gDriveFiles = allFiles.stream()
                .filter(f -> patternWithLastName.matcher(f.getFullPath()).find())
                .count();

        long s3Files = filesToMigrate - gDriveFiles;

        stats.put("totalActiveFiles", allFiles.size());
        stats.put("filesToMigrate", filesToMigrate);
        stats.put("gDriveFiles", gDriveFiles);
        stats.put("s3Files", s3Files);

        return stats;
    }
}
