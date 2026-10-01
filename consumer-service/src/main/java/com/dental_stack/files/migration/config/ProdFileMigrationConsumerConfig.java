package com.dental_stack.files.migration.config;

import com.dental_stack.application.DatabaseContextHolder;
import com.dental_stack.application.DatabaseType;
import com.dental_stack.exception.drive.DriveInstanceException;
import com.dental_stack.exception.file.CustomerEmailNotFoundException;
import com.dental_stack.exception.file.FileMigrationException;
import com.dental_stack.exception.file.FolderMigrationException;
import com.dental_stack.exception.file.PatientNotFoundException;
import com.dental_stack.files.common.repository.FileRepository;
import com.dental_stack.files.common.services.FileService;
import com.dental_stack.files.migration.dto.FileMigrationChunkMessage;
import com.dental_stack.files.migration.projections.LoadFileMatadata;
import com.dental_stack.files.migration.repository.PatientDoctorOrganizationRepository;
import com.dental_stack.files.migration.services.DriveService;
import com.dental_stack.files.migration.utils.MigrationHelper;
import com.google.api.services.drive.Drive;
import java.io.IOException;
import java.util.List;
import java.util.function.Consumer;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
@AllArgsConstructor
public class ProdFileMigrationConsumerConfig {
    private final FileService fileService;
    private final GoogleDriveConfig googleDriveConfig;
    private final FileRepository fileRepository;
    private final PatientDoctorOrganizationRepository pdoRepository;
    private final MigrationHelper migrationHelper;
    private final DriveService driveService;

    @Bean
    public Consumer<FileMigrationChunkMessage> prodFileMigrationConsumer() {
        return message -> {
            log.info(
                    "Job {} | Profile {} | Files {}",
                    message.getJobId(),
                    message.getProfileId(),
                    message.getFileIds().size());
            try {
                DatabaseContextHolder.set(DatabaseType.PROD);
                migrate(message.getProfileId(), message.getFileIds());
                log.info(
                        "Completed migration chunk | Job {} | Profile {} | Files {}",
                        message.getJobId(),
                        message.getProfileId(),
                        message.getFileIds().size());
            } catch (Exception e) {
                log.error(
                        "Failed migration chunk | Job {} | Profile {} | Files {} | Error: {}",
                        message.getJobId(),
                        message.getProfileId(),
                        message.getFileIds().size(),
                        e.getMessage(),
                        e);
                throw e; // Re-throw to trigger RabbitMQ retry
            } finally {
                DatabaseContextHolder.clear();
            }
        };
    }

    private void migrate(Long profileId, List<Long> fileIds) {
        if (fileIds == null || fileIds.isEmpty()) {
            return;
        }
        Drive drive = getDriveInstance(profileId);
        List<LoadFileMatadata> loadFileMetadata = fileRepository.loadFileMetadatas(fileIds);
        loadFileMetadata.forEach(
                (metadata) -> {
                    Long fileId = metadata.getFileId();
                    String name = metadata.getName();
                    String path = metadata.getFullPath();
                    boolean isFolder = Boolean.TRUE.equals(metadata.getIsFolder());
                    try {
                        if (isFolder) {
                            fileService.migrateFolder(profileId, drive, metadata);

                        } else {
                            fileService.migrateFile(profileId, drive, metadata);
                        }
                    } catch (Exception e) {
                        if (isFolder) {
                            throw new FolderMigrationException(fileId, name, path, profileId, e);
                        } else {
                            throw new FileMigrationException(fileId, name, path, profileId, e);
                        }
                    }
                });
        grantAndPermission(drive, profileId, fileIds);
    }

    private void grantAndPermission(Drive drive, Long profileId, List<Long> fileIds) {
        if (fileIds == null || fileIds.isEmpty()) {
            log.warn("grantAndPermission called with empty fileIds, profileId={}", profileId);
            return;
        }

        Long patientId = fileRepository.getPatientId(fileIds);
        if (patientId == null) {
            throw new PatientNotFoundException(profileId);
        }

        String email = pdoRepository.findCustomerEmailByPatientId(patientId);
        if (email == null || email.isBlank()) {
            throw new CustomerEmailNotFoundException(patientId, profileId);
        }

        String path = migrationHelper.getNewPath(patientId);
        log.info(
                "Granting Drive access | profileId={}, patientId={}, email={}, path={}",
                profileId,
                patientId,
                email,
                path);

        driveService.shareFileAndFolder(drive, profileId, path, email);
        List<String> driveFileIds = fileRepository.loadDriveFileId(fileIds);

        log.info(
                "Unsharing {} Drive files | profileId={}, patientId={}, email={}",
                driveFileIds.size(),
                profileId,
                patientId,
                email);

        for (String driveFileId : driveFileIds) {
            try {
                driveService.unShareFileAndFolder(drive, driveFileId, email);

                log.debug("Unshared Drive file | driveFileId={}, email={}", driveFileId, email);

            } catch (IOException ex) {
                log.warn(
                        "Failed to unshare Drive file | driveFileId={}, email={}, profileId={}, patientId={}",
                        driveFileId,
                        email,
                        profileId,
                        patientId,
                        ex);
            }
        }

        log.info(
                "Completed grantAndPermission | profileId={}, patientId={}, files={}",
                profileId,
                patientId,
                driveFileIds.size());
    }

    private Drive getDriveInstance(Long profileId) {
        try {
            return googleDriveConfig.getDriveServiceForUser(profileId);
        } catch (Exception e) {
            throw new DriveInstanceException(profileId, e);
        }
    }
}
