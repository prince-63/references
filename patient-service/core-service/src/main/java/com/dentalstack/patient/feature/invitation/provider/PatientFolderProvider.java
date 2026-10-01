package com.dentalstack.patient.feature.invitation.provider;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.*;

import com.dentalstack.patient.feature.storage.files.dto.CreateFolderRequest;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.dto.UserId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PatientFolderProvider {

    private final ApplicationContext applicationContext;
    private final Executor folderCreationExecutor;

    public PatientFolderProvider(
            ApplicationContext applicationContext,
            @Qualifier("folderCreationExecutor") Executor folderCreationExecutor) {
        this.applicationContext = applicationContext;
        this.folderCreationExecutor = folderCreationExecutor;
    }

    public void createPatientDefaultFolders(Long doctorId, Long patientId) {
        try {
            var filesService = applicationContext.getBean("fileServiceImpl", FilesService.class);

            var doctorUserId =
                    UserId.builder().userId(doctorId).userType(UserType.DOCTOR).build();
            var patientUserId = UserId.builder()
                    .userId(patientId)
                    .userType(UserType.PATIENT)
                    .build();
            var owners = Set.of(doctorUserId, patientUserId);

            List<CompletableFuture<Void>> phase1Futures = new ArrayList<>();

            phase1Futures.add(createFolderAsync(
                    filesService,
                    () -> filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                            .folderName(IMAGE_FOLDER_NAME)
                            .parentPath("/")
                            .uploader(patientUserId)
                            .owners(owners)
                            .isDefaultFolder(true)
                            .isPatientFolder(true)
                            .build()),
                    "Images",
                    patientId));

            phase1Futures.add(createFolderAsync(
                    filesService,
                    () -> filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                            .folderName(DOCUMENTS_FOLDER_NAME)
                            .parentPath("/")
                            .uploader(patientUserId)
                            .owners(owners)
                            .isDefaultFolder(true)
                            .isPatientFolder(true)
                            .build()),
                    "Documents",
                    patientId));

            phase1Futures.add(createFolderAsync(
                    filesService,
                    () -> filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                            .folderName(THREE_D_FOLDER_NAME)
                            .parentPath("/")
                            .uploader(patientUserId)
                            .owners(owners)
                            .isDefaultFolder(true)
                            .isPatientFolder(false)
                            .build()),
                    "3D Files",
                    patientId));

            phase1Futures.add(createFolderAsync(
                    filesService,
                    () -> filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                            .folderName(CHAT_FOLDER_NAME)
                            .parentPath("/")
                            .uploader(patientUserId)
                            .owners(owners)
                            .isDefaultFolder(true)
                            .isPatientFolder(true)
                            .build()),
                    "Chat",
                    patientId));

            CompletableFuture.allOf(phase1Futures.toArray(new CompletableFuture[0]))
                    .join();

            List<CompletableFuture<Void>> phase2Futures = new ArrayList<>();

            phase2Futures.add(createFolderAsync(
                    filesService,
                    () -> filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                            .folderName(PRINT_FILE_FOLDER_NAME)
                            .parentPath(THREE_D_FOLDER_NAME)
                            .uploader(patientUserId)
                            .owners(owners)
                            .isDefaultFolder(true)
                            .isPatientFolder(false)
                            .build()),
                    "3D Files/Print files",
                    patientId));

            phase2Futures.add(createFolderAsync(
                    filesService,
                    () -> filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                            .folderName(SCAN_FILE_FOLDER_NAME)
                            .parentPath(THREE_D_FOLDER_NAME)
                            .uploader(patientUserId)
                            .owners(owners)
                            .isDefaultFolder(true)
                            .isPatientFolder(false)
                            .build()),
                    "3D Files/Scan files",
                    patientId));

            phase2Futures.add(createFolderAsync(
                    filesService,
                    () -> filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                            .folderName(PRE_TREATMENT)
                            .parentPath(IMAGE_FOLDER_NAME)
                            .uploader(patientUserId)
                            .owners(owners)
                            .isDefaultFolder(true)
                            .isPatientFolder(true)
                            .build()),
                    "Images/Pre treatment photos",
                    patientId));

            CompletableFuture.allOf(phase2Futures.toArray(new CompletableFuture[0]))
                    .join();

            log.info("Successfully created default folders for patient: {} (doctorId: {})", patientId, doctorId);
        } catch (Exception e) {
            log.error(
                    "Error creating default folders for patient: {} (doctorId: {}). "
                            + "Missing folders will be auto-created on first upload.",
                    patientId,
                    doctorId,
                    e);
        }
    }

    private CompletableFuture<Void> createFolderAsync(
            FilesService filesService, Runnable folderCreation, String folderName, Long patientId) {
        return CompletableFuture.runAsync(
                () -> {
                    try {
                        folderCreation.run();
                        log.debug("Created folder '{}' for patient: {}", folderName, patientId);
                    } catch (Exception e) {
                        log.error(
                                "Failed to create folder '{}' for patient: {}. "
                                        + "It will be auto-created on first upload attempt.",
                                folderName,
                                patientId,
                                e);
                    }
                },
                folderCreationExecutor);
    }
}
