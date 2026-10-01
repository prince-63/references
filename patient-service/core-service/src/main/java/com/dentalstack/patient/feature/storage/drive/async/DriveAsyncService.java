package com.dentalstack.patient.feature.storage.drive.async;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.CLEAR_ALIGNERS;

import com.dentalstack.patient.feature.invitation.provider.PatientFolderProvider;
import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderHierarchyRequest;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.dto.UserId;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DriveAsyncService {

    private final PatientFolderProvider patientFolderProvider;
    private final AmazonS3Service amazonS3Service;
    private final FileRepository fileRepository;
    private final GoogleDriveService googleDriveService;
    private final FilesService filesService;

    @Value("${aws.s3.buckets.files}")
    private String filesBucket;

    @Async("driveExecutor")
    public CompletableFuture<Void> createPatientFoldersAsync(Long doctorId, Long patientId) {
        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                patientFolderProvider.createPatientDefaultFolders(doctorId, patientId);
                log.info(
                        "Created patient default folders for doctorId: {}, patientId: {} (attempt {})",
                        doctorId,
                        patientId,
                        attempt);
                return CompletableFuture.completedFuture(null);
            } catch (Exception e) {
                log.error(
                        "Attempt {}/{} failed to create patient folders for doctorId: {}, patientId: {}",
                        attempt,
                        maxRetries,
                        doctorId,
                        patientId,
                        e);
                if (attempt < maxRetries) {
                    try {
                        long backoffMs = (long) Math.pow(2, attempt) * 1000;
                        Thread.sleep(backoffMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error(
                                "Retry sleep interrupted for patient folder creation, doctorId: {}, patientId: {}",
                                doctorId,
                                patientId);
                        return CompletableFuture.failedFuture(e);
                    }
                } else {
                    log.error(
                            "All {} retries exhausted for patient folder creation, doctorId: {}, patientId: {}. "
                                    + "Folders will be auto-created on first upload attempt.",
                            maxRetries,
                            doctorId,
                            patientId);
                    return CompletableFuture.failedFuture(e);
                }
            }
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async("folderCreationExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CompletableFuture<Void> createFolderAsync(
            Long profileId, String fullPath, boolean isGDriveEnabled, File folderEntity) {

        try {
            if (isGDriveEnabled) {
                googleDriveService.createFolder(profileId, fullPath);
                log.debug("Created folder in Google Drive at path: {}", fullPath);
            } else {
                amazonS3Service.createFolder(filesBucket, fullPath + "/");
                log.debug("Created folder in S3 at path: {}", fullPath);
            }

            folderEntity.setStatus(com.dentalstack.patient.feature.storage.files.enums.Status.ACTIVE);
            fileRepository.save(folderEntity);

            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("Failed to create folder at path: {}", fullPath, e);

            try {
                folderEntity.setStatus(com.dentalstack.patient.feature.storage.files.enums.Status.FAILED);
                fileRepository.save(folderEntity);
            } catch (Exception saveEx) {
                log.error("Failed to update folder status to FAILED", saveEx);
            }
            return CompletableFuture.failedFuture(e);
        }
    }

    @Async("folderCreationExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CompletableFuture<Void> createBatchFoldersAsync(
            Long profileId, List<String> folderPaths, boolean isGDriveEnabled, List<File> folderEntities) {

        try {
            int totalFolders = folderPaths.size();
            log.info("Starting batch creation of {} folders (isGDrive: {})", totalFolders, isGDriveEnabled);

            int FOLDER_BATCH_SIZE = 50;

            int batchSize = Math.min(FOLDER_BATCH_SIZE, totalFolders);

            for (int i = 0; i < totalFolders; i += batchSize) {
                int end = Math.min(i + batchSize, totalFolders);
                List<String> subBatch = folderPaths.subList(i, end);
                List<File> subBatchEntities = folderEntities.subList(i, end);

                if (isGDriveEnabled) {
                    for (int j = 0; j < subBatch.size(); j++) {
                        googleDriveService.createFolder(profileId, subBatch.get(j));
                        log.debug("Created folder {}/{} in Google Drive", i + j + 1, totalFolders);
                    }
                } else {
                    for (String path : subBatch) {
                        amazonS3Service.createFolder(filesBucket, path + "/");
                    }
                }

                fileRepository.saveAll(subBatchEntities);
                log.info("Saved sub-batch: {}-{}/{} folder entities", i + 1, end, totalFolders);

                subBatch = null;
                subBatchEntities = null;
            }

            log.info("Successfully created and saved all {} folders", totalFolders);
            return CompletableFuture.completedFuture(null);

        } catch (Exception e) {
            log.error(
                    "Failed to create batch folders. Total: {}, isGDrive: {}", folderPaths.size(), isGDriveEnabled, e);
            return CompletableFuture.failedFuture(e);
        }
    }

    @Async("folderCreationExecutor")
    public CompletableFuture<Void> createTreatmentPlanDefaultFolderAsync(
            TreatmentPlanRequest request, TreatmentPlan treatmentPlan) {

        try {
            var doctorId = UserId.builder()
                    .userId(request.getDoctorId())
                    .userType(UserType.DOCTOR)
                    .build();
            var patientId = UserId.builder()
                    .userId(request.getPatientId())
                    .userType(UserType.PATIENT)
                    .build();

            log.info("Creating parent folders for treatment plan: {}", treatmentPlan.getTreatmentPlanName());

            createFolderWithRetry(
                    () -> filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                            .folderName(CLEAR_ALIGNERS)
                            .parentPath("/")
                            .uploader(patientId)
                            .owners(Set.of(patientId, doctorId))
                            .isDefaultFolder(true)
                            .isPatientFolder(true)
                            .build()),
                    "Clear Aligners root folder");

            createFolderWithRetry(
                    () -> filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                            .folderName(treatmentPlan.getTreatmentPlanName())
                            .parentPath(CLEAR_ALIGNERS)
                            .uploader(patientId)
                            .owners(Set.of(patientId, doctorId))
                            .isDefaultFolder(true)
                            .isPatientFolder(true)
                            .build()),
                    "Treatment plan folder: " + treatmentPlan.getTreatmentPlanName());

            Optional.ofNullable(request.getAlignerTreatmentDetails())
                    .filter(details -> details.getLowerJaw() != null && details.getUpperJaw() != null)
                    .ifPresent(details -> {
                        List<Integer> allNumbers = Stream.concat(
                                        details.getLowerJaw().getRange().stream(),
                                        details.getUpperJaw().getRange().stream())
                                .toList();

                        int lowestNumber =
                                allNumbers.stream().min(Integer::compareTo).orElse(Integer.MAX_VALUE);
                        int highestNumber =
                                allNumbers.stream().max(Integer::compareTo).orElse(Integer.MIN_VALUE);

                        String treatmentPlanFolderPath = Paths.get(
                                        "/" + CLEAR_ALIGNERS, treatmentPlan.getTreatmentPlanName())
                                .toString();

                        List<String> folderNames = IntStream.iterate(highestNumber, i -> i >= lowestNumber, i -> i - 1)
                                .mapToObj(i -> String.format("Aligner %d", i))
                                .toList();

                        int totalFolders = folderNames.size();
                        log.info(
                                "Creating {} aligner folders for treatment plan: {}",
                                totalFolders,
                                treatmentPlan.getTreatmentPlanName());

                        int batchSize = 20;
                        for (int i = 0; i < totalFolders; i += batchSize) {
                            int end = Math.min(i + batchSize, totalFolders);
                            List<String> batch = folderNames.subList(i, end);

                            batch.forEach(folderName -> {
                                try {

                                    filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                                            .folderName(folderName)
                                            .parentPath(treatmentPlanFolderPath)
                                            .uploader(patientId)
                                            .owners(Set.of(patientId, doctorId))
                                            .isDefaultFolder(true)
                                            .isPatientFolder(true)
                                            .build());
                                } catch (Exception e) {
                                    log.error("Failed to create aligner folder: {}", folderName, e);
                                }
                            });

                            log.info("Created batch {}-{}/{} aligner folders", i + 1, end, totalFolders);

                            batch = null;
                        }

                        log.info("Completed creation of all {} aligner folders", totalFolders);
                    });

            return CompletableFuture.completedFuture(null);

        } catch (Exception e) {
            log.error("Failed to create treatment plan folders for: {}", treatmentPlan.getTreatmentPlanName(), e);
            return CompletableFuture.failedFuture(e);
        }
    }

    private void createFolderWithRetry(Runnable folderCreation, String folderDescription) {
        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                folderCreation.run();
                return;
            } catch (Exception e) {
                log.warn(
                        "Attempt {}/{} failed to create folder '{}': {}",
                        attempt,
                        maxRetries,
                        folderDescription,
                        e.getMessage());
                if (attempt < maxRetries) {
                    try {
                        long backoffMs = (long) Math.pow(2, attempt) * 1000;
                        Thread.sleep(backoffMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("Retry sleep interrupted for folder creation: {}", folderDescription);
                        return;
                    }
                } else {
                    log.error(
                            "All {} retries exhausted for folder '{}'. "
                                    + "Folder will be auto-created on first upload attempt.",
                            maxRetries,
                            folderDescription,
                            e);
                }
            }
        }
    }

    @Async("folderCreationExecutor")
    public CompletableFuture<Void> createFolderHierarchiesAsync(
            List<CreateFolderHierarchyRequest> requests, String description) {
        log.info("Starting async creation of {} folder hierarchies for: {}", requests.size(), description);
        for (var request : requests) {
            createFolderWithRetry(
                    () -> filesService.createFolderHierarchy(request), description + " [" + request.getPath() + "]");
        }
        log.info("Completed async folder hierarchy creation for: {}", description);
        return CompletableFuture.completedFuture(null);
    }

    @Async("folderCreationExecutor")
    public CompletableFuture<Void> createFoldersAsync(List<CreateFolderRequest> requests, String description) {
        log.info("Starting async creation of {} folders for: {}", requests.size(), description);
        for (var request : requests) {
            createFolderWithRetry(
                    () -> filesService.createFolderIfNotExists(request),
                    description + " [" + request.getFolderName() + "]");
        }
        log.info("Completed async folder creation for: {}", description);
        return CompletableFuture.completedFuture(null);
    }
}
