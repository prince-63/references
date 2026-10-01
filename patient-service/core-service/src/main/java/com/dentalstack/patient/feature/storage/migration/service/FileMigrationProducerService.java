package com.dentalstack.patient.feature.storage.migration.service;

import com.dentalstack.patient.feature.notification.service.SlackService;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.migration.dto.FileMigrationChunkMessage;
import com.dentalstack.patient.feature.storage.migration.dto.MigrationStatus;
import com.dentalstack.patient.feature.storage.migration.dto.MoveFileChunkMessage;
import com.dentalstack.patient.feature.storage.migration.enums.DriveMigrationStatus;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionRepository;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileMigrationProducerService {

    private final StreamBridge streamBridge;
    private final FileRepository fileRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SlackService slackService;
    private final UserProfileRepository userProfileRepository;

    private static final int CHUNK_SIZE = 1;
    private static final double COMPLETION_THRESHOLD_PERCENT = 95.0;

    @Transactional
    public String startMigration(Long profileId) {
        String jobId = UUID.randomUUID().toString();
        Long lastId = 0L;
        while (true) {
            List<Long> fileIds = fileRepository.fetchNextFileIds(profileId, lastId, PageRequest.of(0, CHUNK_SIZE));
            if (fileIds.isEmpty()) break;
            FileMigrationChunkMessage message = new FileMigrationChunkMessage(jobId, profileId, fileIds);
            streamBridge.send("fileMigration-out-0", message);
            lastId = fileIds.get(fileIds.size() - 1);
        }
        log.info("Migration job {} published", jobId);
        return jobId;
    }

    @Transactional
    public String startMovingFile(Long profileId) {
        String jobId = UUID.randomUUID().toString();

        publishChunks(jobId, profileId, false);
        publishChunks(jobId, profileId, true);

        log.info("Migration job {} published", jobId);
        return jobId;
    }

    private void publishChunks(String jobId, Long profileId, boolean folder) {
        Long lastId = 0L;

        while (true) {
            List<Long> ids = folder
                    ? fileRepository.fetchNextMoveFolderIds(profileId, lastId, PageRequest.of(0, CHUNK_SIZE))
                    : fileRepository.fetchNextMoveFileIds(profileId, lastId, PageRequest.of(0, CHUNK_SIZE));

            if (ids.isEmpty()) break;

            streamBridge.send("moveFile-out-0", new MoveFileChunkMessage(jobId, profileId, ids));

            lastId = ids.get(ids.size() - 1);
        }
    }

    public MigrationStatus getMigrationStatus(Long profileId) {
        Long deletedFiles = fileRepository.countAllDeletedFileByProfileId(profileId);
        Long totalActiveFiles = fileRepository.countAllFileByProfileId(profileId);
        Long remainingFiles = Math.min(fileRepository.countRemainingFileByProfileId(profileId), totalActiveFiles);
        Long migratedFiles = Math.max(totalActiveFiles - remainingFiles, 0);
        double progress = totalActiveFiles == 0 ? 100 : ((double) migratedFiles / totalActiveFiles) * 100;
        double boundedProgress = Math.min(progress, 100.0);

        String status;
        if (boundedProgress >= COMPLETION_THRESHOLD_PERCENT) {
            status = "COMPLETED";
        } else if (migratedFiles > 0) {
            status = "IN_PROGRESS";
        } else {
            status = "NOT_STARTED";
        }

        syncDriveMigrationState(profileId, boundedProgress, migratedFiles, totalActiveFiles, deletedFiles, status);
        return new MigrationStatus(profileId, totalActiveFiles, migratedFiles, remainingFiles, deletedFiles, status);
    }

    private void syncDriveMigrationState(
            Long profileId,
            double progress,
            Long migratedFiles,
            Long totalActiveFiles,
            Long deletedFiles,
            String status) {
        DriveMigrationStatus currentStatus =
                subscriptionRepository.findDriveStatusByUserProfileId(profileId).orElse(DriveMigrationStatus.PENDING);

        if (currentStatus == DriveMigrationStatus.COMPLETED) {
            return;
        }

        if (progress >= 100.0) {
            subscriptionRepository.changeDriveStatus(profileId, DriveMigrationStatus.COMPLETED);
            sendCompletionSlackNotification(profileId, totalActiveFiles, migratedFiles, deletedFiles, status);
            return;
        }

        if (migratedFiles > 0 && currentStatus == DriveMigrationStatus.PENDING) {
            subscriptionRepository.changeDriveStatus(profileId, DriveMigrationStatus.IN_PROGRESS);
        }
    }

    private void sendCompletionSlackNotification(
            Long profileId, Long totalActiveFiles, Long migratedFiles, Long deletedFiles, String status) {
        Long remainingFiles = Math.max(totalActiveFiles - migratedFiles, 0);
        MigrationStatus migrationStatus =
                new MigrationStatus(profileId, totalActiveFiles, migratedFiles, remainingFiles, deletedFiles, status);

        userProfileRepository
                .userProfileDetailsById(profileId)
                .ifPresentOrElse(
                        profileSummary ->
                                slackService.sendMigrationCompletionMessage(profileSummary, migrationStatus, 100.0),
                        () -> log.warn(
                                "Skipping migration completion Slack notification. Profile {} not found", profileId));
    }
}
