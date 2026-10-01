package com.dentalstack.patient.feature.storage.drive.async;

import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderHierarchyRequest;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
@Slf4j
public class DriveAsyncHelper {

    private final DriveAsyncService driveAsyncService;

    public DriveAsyncHelper(@Lazy DriveAsyncService driveAsyncService) {
        this.driveAsyncService = driveAsyncService;
    }

    public void createPatientFoldersAsync(Long doctorId, Long patientId) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    log.debug(
                            "Transaction committed, triggering async folder creation for doctorId: {} and patientId: {}",
                            doctorId,
                            patientId);
                    driveAsyncService.createPatientFoldersAsync(doctorId, patientId);
                }
            });
        } else {
            log.debug(
                    "No active transaction, executing async folder creation immediately for doctorId: {} and patientId: {}",
                    doctorId,
                    patientId);
            driveAsyncService.createPatientFoldersAsync(doctorId, patientId);
        }
    }

    public void createFolderAsync(Long profileId, String fullPath, boolean isGDriveEnabled, File folderEntity) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    log.debug("Transaction committed, triggering async folder creation for path: {}", fullPath);
                    driveAsyncService.createFolderAsync(profileId, fullPath, isGDriveEnabled, folderEntity);
                }
            });
        } else {
            log.debug("No active transaction, executing async folder creation immediately for path: {}", fullPath);
            driveAsyncService.createFolderAsync(profileId, fullPath, isGDriveEnabled, folderEntity);
        }
    }

    public void createBatchFoldersAsync(
            Long profileId, List<String> folderPaths, boolean isGDriveEnabled, List<File> folderEntities) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    log.debug(
                            "Transaction committed, triggering async batch folder creation for {} folders",
                            folderPaths.size());
                    driveAsyncService.createBatchFoldersAsync(profileId, folderPaths, isGDriveEnabled, folderEntities);
                }
            });
        } else {
            log.debug(
                    "No active transaction, executing async batch folder creation immediately for {} folders",
                    folderPaths.size());
            driveAsyncService.createBatchFoldersAsync(profileId, folderPaths, isGDriveEnabled, folderEntities);
        }
    }

    public void createTreatmentPlanDefaultFolderAsync(TreatmentPlanRequest request, TreatmentPlan treatmentPlan) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    log.debug(
                            "Transaction committed, triggering async treatment plan folder creation for: {}",
                            treatmentPlan.getTreatmentPlanName());
                    driveAsyncService.createTreatmentPlanDefaultFolderAsync(request, treatmentPlan);
                }
            });
        } else {
            log.debug(
                    "No active transaction, executing async treatment plan folder creation immediately for: {}",
                    treatmentPlan.getTreatmentPlanName());
            driveAsyncService.createTreatmentPlanDefaultFolderAsync(request, treatmentPlan);
        }
    }

    public void createFolderHierarchiesAsync(List<CreateFolderHierarchyRequest> requests, String description) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    log.debug("Transaction committed, triggering async folder hierarchy creation for: {}", description);
                    driveAsyncService.createFolderHierarchiesAsync(requests, description);
                }
            });
        } else {
            log.debug(
                    "No active transaction, executing async folder hierarchy creation immediately for: {}",
                    description);
            driveAsyncService.createFolderHierarchiesAsync(requests, description);
        }
    }

    public void createFoldersAsync(List<CreateFolderRequest> requests, String description) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    log.debug("Transaction committed, triggering async folder creation for: {}", description);
                    driveAsyncService.createFoldersAsync(requests, description);
                }
            });
        } else {
            log.debug("No active transaction, executing async folder creation immediately for: {}", description);
            driveAsyncService.createFoldersAsync(requests, description);
        }
    }
}
