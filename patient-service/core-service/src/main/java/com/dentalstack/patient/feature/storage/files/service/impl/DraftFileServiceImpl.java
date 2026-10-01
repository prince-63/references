package com.dentalstack.patient.feature.storage.files.service.impl;

import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.exception.FileNotFoundException;
import com.dentalstack.patient.feature.storage.files.exception.InvalidFullPathException;
import com.dentalstack.patient.feature.storage.files.exception.ParentFileNotFoundException;
import com.dentalstack.patient.feature.storage.files.repository.DraftFileRepository;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.files.service.DraftFileService;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.entity.DraftFile;
import com.dentalstack.patient.global.exception.BadRequestException;
import jakarta.validation.constraints.NotNull;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class DraftFileServiceImpl implements DraftFileService {

    private final AmazonS3Service amazonS3Service;
    private final FilesService filesService;

    private final DraftFileRepository draftFileRepository;
    private final FileRepository fileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;

    @Value("${app.cloud.amazon.s3.bucket.files}")
    private String filesBucket;

    @Override
    @Transactional
    public Set<DraftFile> uploadFiles(
            long ownerUserId,
            @NotNull UserType ownerUserType,
            long uploaderUserId,
            @NotNull UserType uploaderUserType,
            String parentPath,
            @NotNull MultipartFile[] files) {
        Set<DraftFile> draftFiles = new HashSet<>();
        var rootPath = rootPath(ownerUserId, ownerUserType);
        for (MultipartFile multipartFile : files) {
            try {
                String fileName = multipartFile.getOriginalFilename();
                var filePath = Paths.get(rootPath, parentPath, fileName).toString();
                String imageUrl = amazonS3Service.storeFile(filesBucket, filePath, multipartFile);
                DraftFile draftFile = draftFileRepository.save(DraftFile.from(
                        imageUrl,
                        ownerUserId,
                        ownerUserType,
                        uploaderUserId,
                        uploaderUserType,
                        fileName,
                        filePath,
                        multipartFile.getSize()));
                draftFiles.add(draftFile);
            } catch (Exception e) {
                log.warn("Failed to upload draft file: {}", e.getMessage());
            }
        }
        return draftFiles;
    }

    @Override
    public String rootPath(long userId, @NotNull UserType userType) {
        return Paths.get(userType.name().toLowerCase(), String.valueOf(userId), DRAFT_FOLDER_NAME)
                .toString();
    }

    @Override
    @Transactional
    public File moveDraftToFiles(DraftFile draftFile, String newFilesParentPath, Long patientId) {
        var draftFileFullPath = draftFile.getFullPath();
        var draftFileName = draftFile.getName();
        var draftFileOwnerId = draftFile.getOwnerUserId();
        var draftFileOwnerType = draftFile.getOwnerUserType();

        var filesRootPath = filesService.rootPath(draftFile.getOwnerUserId(), draftFile.getOwnerUserType());
        var newFilesFullPath =
                Paths.get(filesRootPath, newFilesParentPath, draftFileName).toString();
        var newParentFullPath = Paths.get(filesRootPath, newFilesParentPath).toString();
        File parentFile = null;
        if (!newParentFullPath.equals(filesRootPath)) {
            parentFile = filesService
                    .getFile(draftFileOwnerId, draftFileOwnerType, newParentFullPath)
                    .orElseThrow(() -> new InvalidFullPathException(newParentFullPath));
        }
        if (parentFile != null && !parentFile.isFolder()) {
            throw new ParentFileNotFoundException(newParentFullPath);
        }

        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patientId)
                .orElseThrow(() -> new BadRequestException("Patient doctor organization not found"));

        var newUrl = amazonS3Service.moveFile(filesBucket, draftFileFullPath, newFilesFullPath);
        var file = File.newFile(
                UserId.builder()
                        .userId(draftFile.getCreatedBy())
                        .userType(draftFile.getCreatedByUserType())
                        .build(),
                Set.of(UserId.builder()
                        .userId(draftFileOwnerId)
                        .userType(draftFileOwnerType)
                        .build()),
                draftFileName,
                newFilesFullPath,
                newUrl,
                parentFile,
                draftFile.getSize(),
                patientDoctorOrganization);

        return fileRepository.save(file);
    }

    @Override
    public Set<File> moveDraftToFiles(Set<DraftFile> draftFiles, String newFilesParentPath, Long patientId) {
        var files = new HashSet<File>();
        var failedFiles = new ArrayList<>();

        for (var draftFile : draftFiles) {
            try {
                files.add(moveDraftToFiles(draftFile, newFilesParentPath, patientId));
            } catch (FileNotFoundException | AmazonS3Exception e) {
                log.warn("Failed to move draft file {}: {}", draftFile.getFullPath(), e.getMessage());
                failedFiles.add(draftFile.getFullPath());
            }
        }

        if (!failedFiles.isEmpty()) {
            log.warn("Some draft files could not be moved: {}", failedFiles);
        }

        return files;
    }
}
