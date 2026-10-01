package com.dentalstack.patient.feature.storage.files.service.impl;

import static com.dentalstack.patient.feature.user.enums.UserType.PATIENT;

import com.amazonaws.AmazonServiceException;
import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.repository.AppointmentRepository;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.notification.dto.RemoveFilesAndImagesRequest;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.drive.GDrivePlatformProvider;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.UploadedChunkContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDriveService;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.domain.*;
import com.dentalstack.patient.feature.storage.files.domain.FileUploadDetails;
import com.dentalstack.patient.feature.storage.files.domain.MoveFilesDetails;
import com.dentalstack.patient.feature.storage.files.dto.*;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.entity.FileOwner;
import com.dentalstack.patient.feature.storage.files.entity.FilePermission;
import com.dentalstack.patient.feature.storage.files.enums.FilePermissionType;
import com.dentalstack.patient.feature.storage.files.enums.HasShared;
import com.dentalstack.patient.feature.storage.files.enums.Status;
import com.dentalstack.patient.feature.storage.files.exception.*;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import com.dentalstack.patient.feature.storage.s3.AmazonS3ServiceImpl;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.PatientAddedPhotoEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import com.dentalstack.patient.global.utils.IDGenerator;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileServiceImpl implements FilesService {

    private final AmazonS3Service amazonS3Service;

    private final GoogleDriveService driveService;

    private final OptimizedDriveService optimizedDriveService;

    private final FileRepository fileRepository;

    @Lazy
    @Autowired
    private TimelineService timelineService;

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final DoctorService doctorService;
    private final ChatService chatService;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final GDrivePlatformProvider gDrivePlatformProvider;

    @Value("${app.cloud.amazon.s3.bucket.files}")
    private String filesBucket;

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public void createFolder(CreateFolderRequest request) throws Exception {
        var uploader = request.getUploader();
        var uploaderUserId = uploader.getUserId();
        var uploaderUserType = uploader.getUserType();
        var folderName = request.getFolderName();
        var parentPath = request.getParentPath();

        if (!List.of(UserType.DOCTOR, PATIENT).contains(uploaderUserType)) {
            throw new BadRequestException("Only doctor or patient are allowed to upload files");
        }

        var rootPathUser = getRootPathUser(request.getUploader(), request.getOwners());
        var rootPath =
                rootPath(rootPathUser.getUserId(), rootPathUser.getUserType()).replace("\\", "/");
        var parentFullPath = Paths.get(rootPath, parentPath).toString().replace("\\", "/");
        File parentFile = null;

        if (!parentFullPath.equals(rootPath)) {
            Optional<File> fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), parentFullPath);

            if (fileOptional.isEmpty()) {
                var fullNameRoot = fullNameRootPath(rootPathUser.getUserId(), rootPathUser.getUserType())
                        .replace("\\", "/");
                var fullNameParentFullPath =
                        Paths.get(fullNameRoot, parentPath).toString().replace("\\", "/");
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), fullNameParentFullPath);
                if (fileOptional.isPresent()) {
                    rootPath = fullNameRoot;
                    parentFullPath = fullNameParentFullPath;
                }
            }

            if (fileOptional.isEmpty()) {
                var idRoot = patientIdRootPath(rootPathUser.getUserId(), rootPathUser.getUserType())
                        .replace("\\", "/");
                var idParentFullPath = Paths.get(idRoot, parentPath).toString().replace("\\", "/");
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), idParentFullPath);
                if (fileOptional.isPresent()) {
                    rootPath = idRoot;
                    parentFullPath = idParentFullPath;
                }
            }

            String finalParentFullPath = parentFullPath;
            parentFile = fileOptional.orElseThrow(() -> new InvalidFullPathException(finalParentFullPath));
        }

        var fullPath = Paths.get(parentFullPath, folderName).toString().replace("\\", "/");

        var patientOwner = request.getOwners().stream()
                .filter(owner -> owner.getUserType() == PATIENT)
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Patient owner is required"));

        boolean folderExists = fileRepository.existsByPatientOwnerAndFullPath(
                patientOwner.getUserId(), PATIENT, fullPath, Status.ACTIVE);

        if (folderExists) {
            throw new FileAlreadyExistsException(patientOwner.getUserId(), PATIENT, fullPath);
        }

        if (!fileRepository
                .findByUploaderUserIdAndUploaderUserTypeAndFullPathAndStatus(
                        rootPathUser.getUserId(), rootPathUser.getUserType(), fullPath, Status.ACTIVE)
                .isEmpty()) {
            throw new FileAlreadyExistsException(rootPathUser.getUserId(), rootPathUser.getUserType(), fullPath);
        }

        if (!fileRepository
                .findByUploaderUserIdAndUploaderUserTypeAndFullPathAndStatus(
                        uploaderUserId, uploaderUserType, fullPath, Status.ACTIVE)
                .isEmpty()) {
            throw new FileAlreadyExistsException(uploaderUserId, uploaderUserType, fullPath);
        }

        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patientOwner.getUserId())
                .orElseThrow(() -> new BadRequestException("Patient doctor organization not found"));

        GDriveStatus gDriveStatus = gDrivePlatformProvider.getGDriveStatus(patientDoctorOrganization);
        boolean isEnabled = gDriveStatus.enabled;
        UserProfile userProfile = gDriveStatus.userProfile;

        String driveFileId = null;
        if (isEnabled) {
            Patient patient = patientDoctorOrganization.getPatient();
            if (patient == null) {
                throw new BadRequestException("Patient doctor organization patient is null");
            }
            driveFileId = driveService.createFolder(userProfile.getId(), fullPath);
        } else {
            amazonS3Service.createFolder(filesBucket, fullPath + "/");
        }

        var folder = File.newFolder(
                uploader, request.getOwners(), folderName, parentFile, fullPath, userProfile, isEnabled, driveFileId);
        folder.setDefaultFolder(request.getIsDefaultFolder() != null && request.getIsDefaultFolder());
        folder.setPatientFolder(request.getIsPatientFolder() != null && request.getIsPatientFolder());
        folder.setIsPurchaseOrderFile(request.getIsPurchaseOrderFile() != null && request.getIsPurchaseOrderFile());
        fileRepository.save(folder);
        if (parentFile != null) {
            parentFile.addChildFile(folder);
            fileRepository.save(parentFile);
        }

        log.info(
                "{} with id {} created a new folder with name {} for patient {}",
                uploaderUserType,
                uploaderUserId,
                folderName,
                patientOwner.getUserId());
    }

    private static List<String> getEmailList(PatientDoctorOrganization patientDoctorOrganization) {
        List<String> emails = new ArrayList<>();
        if (patientDoctorOrganization.getUserProfile().getUser().getEmail() != null
                && !patientDoctorOrganization
                        .getUserProfile()
                        .getUser()
                        .getEmail()
                        .isEmpty()) {
            emails.add(patientDoctorOrganization.getUserProfile().getUser().getEmail());
        }
        return emails;
    }

    @Override
    public double getSizeOfTheFolder(GetFolderSizeRequest request) throws Exception {
        boolean isEnabled =
                gDrivePlatformProvider.isGDrivePlatformEnabled(request.getDoctorId(), request.getProfileId());

        if (isEnabled) {
            return driveService.getFolderSizeInMB(request.getProfileId(), request.getPath());
        } else {
            return amazonS3Service.getFolderSizeInMB(filesBucket, request.getPath());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserFilesDetails getFiles(
            long requesterUserId,
            UserType requesterUserType,
            long ownerUserId,
            UserType ownerUserType,
            @NotNull String parentPath) {
        if (!parentPath.startsWith("/")) {
            throw new BadRequestException("parent path should be absolute and start with `/`");
        }

        List<String> possibleFullPath = List.of(
                Paths.get(rootPath(ownerUserId, ownerUserType), parentPath).toString(),
                Paths.get(fullNameRootPath(ownerUserId, ownerUserType), parentPath)
                        .toString(),
                Paths.get(patientIdRootPath(ownerUserId, ownerUserType), parentPath)
                        .toString());

        List<String> paths = possibleFullPath.stream()
                .map(p -> p.replace("\\", "/").trim() + "%")
                .toList();

        List<Long> fileIds = fileRepository.findAllFileIds(ownerUserId, ownerUserType.name());
        List<File> filesByRootPath = fileRepository.findByDynamicPath(fileIds, paths.get(0), Status.ACTIVE);
        List<File> filesByFullNamePath = fileRepository.findByDynamicPath(fileIds, paths.get(1), Status.ACTIVE);
        List<File> filesByPatientIdPath = fileRepository.findByDynamicPath(fileIds, paths.get(2), Status.ACTIVE);

        filesByRootPath.addAll(filesByFullNamePath);
        filesByRootPath.addAll(filesByPatientIdPath);

        List<File> deduplicatedFiles = new ArrayList<>(new LinkedHashSet<>(filesByRootPath));
        List<File> filteredFiles = deduplicatedFiles.stream()
                .filter(file -> {
                    if (parentPath.equals("/")) {
                        if (file.getParentFile() == null) {
                            return true;
                        }
                    }
                    var parentFile = file.getParentFile();
                    if (parentFile == null) {
                        return false;
                    }
                    var rootPathUser = getRootPathUser(
                            UserId.builder()
                                    .userId(parentFile.getUploaderUserId())
                                    .userType(parentFile.getUploaderUserType())
                                    .build(),
                            parentFile.getOwners().stream()
                                    .map(o -> UserId.builder()
                                            .userId(o.getUserId())
                                            .userType(o.getUserType())
                                            .build())
                                    .collect(Collectors.toSet()));

                    List<String> filterPath = List.of(
                            Paths.get(rootPath(rootPathUser.getUserId(), rootPathUser.getUserType()), parentPath)
                                    .toString(),
                            Paths.get(
                                            fullNameRootPath(rootPathUser.getUserId(), rootPathUser.getUserType()),
                                            parentPath)
                                    .toString(),
                            Paths.get(
                                            patientIdRootPath(rootPathUser.getUserId(), rootPathUser.getUserType()),
                                            parentPath)
                                    .toString());

                    List<String> newPaths = filterPath.stream()
                            .map(p -> p.replace("\\", "/").trim())
                            .toList();

                    return newPaths.contains(parentFile.getFullPath());
                })
                .toList();

        List<File> folders = filteredFiles.stream().filter(File::isFolder).collect(Collectors.toList());
        List<File> otherFiles =
                filteredFiles.stream().filter(file -> !file.isFolder()).collect(Collectors.toList());

        folders.sort(Comparator.comparing(File::getUpdatedAt).reversed());
        otherFiles.sort(Comparator.comparing(File::getUpdatedAt).reversed());

        List<File> sortedFiles = new ArrayList<>(folders);
        sortedFiles.addAll(otherFiles);

        return UserFilesDetails.from(sortedFiles);
    }

    @Override
    @Transactional(rollbackFor = BusinessException.class)
    public void deleteFiles(DeleteFilesRequest request) {

        var owner = request.getOwner();
        Set<Long> requestedFileIds = request.getFilesToDeleteById();

        if (requestedFileIds == null || requestedFileIds.isEmpty()) {
            return;
        }

        List<Object[]> rows =
                fileRepository.findFileMetaByOwnerAndFileIds(owner.getUserId(), owner.getUserType(), requestedFileIds);

        List<Long> fileIds = new ArrayList<>();
        List<String> imageUrls = new ArrayList<>();

        for (Object[] row : rows) {
            Long fileId = (Long) row[0];

            if (!requestedFileIds.contains(fileId)) {
                continue;
            }

            String fullPath = (String) row[1];
            String url = (String) row[2];
            Long profileId = (Long) row[3];
            Long doctorId = (Long) row[4];

            boolean isEnabled = gDrivePlatformProvider.isGDrivePlatformEnabled(doctorId, profileId);

            try {
                if (isEnabled && profileId != null) {
                    driveService.deleteFile(profileId, fullPath);
                } else {
                    amazonS3Service.deleteFile(filesBucket, fullPath);
                }
            } catch (Exception e) {
                log.error("Storage delete failed for fileId {}", fileId, e);
            }

            removeFileFromAppointments(fileId);

            fileIds.add(fileId);
            imageUrls.add(url);
        }

        if (!fileIds.isEmpty()) {
            fileRepository.softDeleteFileById(
                    fileIds,
                    request.getDeleter().getUserId(),
                    request.getDeleter().getUserType(),
                    Status.DELETED,
                    ZonedDateTime.now());
        }

        try {
            chatService.removeFilesAndImages(RemoveFilesAndImagesRequest.builder()
                    .fileIds(fileIds)
                    .imageUrls(imageUrls)
                    .build());
        } catch (Exception e) {
            log.error("Error deleting file from chat service", e);
        }

        log.info(
                "Successfully deleted {} files of {} with id {}",
                fileIds.size(),
                owner.getUserType(),
                owner.getUserId());
    }

    @Transactional
    public void removeFileFromAppointments(Long fileId) {
        List<Appointment> appointments = appointmentRepository.findAppointmentsByFileId(fileId);

        for (Appointment appointment : appointments) {
            appointment.getFiles().removeIf(file -> file.getId().equals(fileId));
        }
    }

    @Transactional(rollbackFor = BusinessException.class)
    @Override
    public void deleteFilesById(DeleteFilesRequest request) {

        List<File> filesToDelete = List.of();

        if (request.getFilesToDeleteById() != null) {
            filesToDelete = fileRepository.findByFileIds(request.getFilesToDeleteById());
        }
        List<Long> fileIds = new ArrayList<>();
        List<String> imageUrls = new ArrayList<>();

        for (File file : filesToDelete) {
            try {
                boolean isEnabled = gDrivePlatformProvider.isGDrivePlatformEnabled(
                        file.getUserProfile().getDoctor().getId(),
                        file.getUserProfile().getId());

                if (isEnabled && file.getUserProfile().getId() != null) {
                    driveService.deleteFile(file.getUserProfile().getId(), file.getFullPath());
                } else {
                    amazonS3Service.deleteFile(filesBucket, file.getFullPath());
                }
                fileIds.add(file.getId());
                imageUrls.add(file.getUrl());

                file.delete(request.getDeleter());
                fileRepository.save(file);

            } catch (Exception ignored) {

            }
        }
        var removeFilesAndImagesRequest = RemoveFilesAndImagesRequest.builder()
                .fileIds(fileIds)
                .imageUrls(imageUrls)
                .build();
        try {
            chatService.removeFilesAndImages(removeFilesAndImagesRequest);
        } catch (Exception e) {
            log.error("Error deleting file from chat services");
        }
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public FileUploadDetails uploadFiles(
            UploadFilesRequest request, MultipartFile[] files, Boolean isPatientUploading) {
        var uploaderUserId = request.getUploader().getUserId();
        var uploaderUserType = request.getUploader().getUserType();
        var parentPath = request.getParentPath();

        if (!List.of(UserType.DOCTOR, PATIENT).contains(uploaderUserType)) {
            throw new BadRequestException("Only doctor or patient are allowed to upload files");
        }

        var rootPathUser = getRootPathUser(request.getUploader(), request.getOwners());
        var rootPath =
                rootPath(rootPathUser.getUserId(), rootPathUser.getUserType()).replace("\\", "/");
        var parentFullPath = Paths.get(rootPath, parentPath).toString().replace("\\", "/");
        File parentFile = null;

        if (!parentFullPath.equals(rootPath)) {
            Optional<File> fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), parentFullPath);

            if (fileOptional.isEmpty()) {
                var fullNameRoot = fullNameRootPath(rootPathUser.getUserId(), rootPathUser.getUserType())
                        .replace("\\", "/");
                var fullNameParentFullPath =
                        Paths.get(fullNameRoot, parentPath).toString().replace("\\", "/");
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), fullNameParentFullPath);
                if (fileOptional.isPresent()) {
                    rootPath = fullNameRoot;
                    parentFullPath = fullNameParentFullPath;
                }
            }

            if (fileOptional.isEmpty()) {
                var idRoot = patientIdRootPath(rootPathUser.getUserId(), rootPathUser.getUserType())
                        .replace("\\", "/");
                var idParentFullPath = Paths.get(idRoot, parentPath).toString().replace("\\", "/");
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), idParentFullPath);
                if (fileOptional.isPresent()) {
                    rootPath = idRoot;
                    parentFullPath = idParentFullPath;
                }
            }

            if (fileOptional.isEmpty()) {
                log.info("Parent folder not found, auto-creating folder hierarchy for path: {}", parentPath);
                createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                        .path(parentPath)
                        .uploader(request.getUploader())
                        .owners(request.getOwners())
                        .isDefaultFolder(false)
                        .isPatientFolder(false)
                        .build());
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), parentFullPath);
            }

            String finalParentFullPath = parentFullPath;
            parentFile = fileOptional.orElseThrow(() -> new InvalidFullPathException(finalParentFullPath));
        }

        if (parentFile != null && !parentFile.isFolder()) {
            throw new ParentFileNotFoundException(parentPath);
        }

        var failedToUpload = new ArrayList<FileOperationFailureDetails>();
        var uploaded = new ArrayList<File>();
        Set<String> uploadedFileNames = new HashSet<>();

        var patientOwner = request.getOwners().stream()
                .filter(owner -> owner.getUserType() == PATIENT)
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Patient owner is required"));

        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patientOwner.getUserId())
                .orElseThrow(() -> new BadRequestException("Patient doctor organization not found"));

        GDriveStatus gDriveStatus = gDrivePlatformProvider.getGDriveStatus(patientDoctorOrganization);
        boolean isGDriveEnabled = gDriveStatus.enabled;

        if (isGDriveEnabled) {

            try {

                List<MultipartFile> uniqueFiles = new ArrayList<>();
                for (var multipartFile : files) {
                    var fileName = multipartFile.getOriginalFilename();
                    if (!uploadedFileNames.contains(fileName)) {
                        uniqueFiles.add(multipartFile);
                        uploadedFileNames.add(fileName);
                    } else {
                        log.warn("Duplicate file {} not uploaded", fileName);
                    }
                }

                if (!uniqueFiles.isEmpty()) {

                    List<File> uploadedFiles = uploadMultipleFileInCloud(
                            request,
                            uniqueFiles.toArray(new MultipartFile[0]),
                            rootPath,
                            parentPath,
                            parentFile,
                            patientDoctorOrganization);

                    for (File uploadedFile : uploadedFiles) {
                        uploadedFile = fileRepository.save(uploadedFile);
                        if (parentFile != null) {
                            parentFile.addChildFile(uploadedFile);
                        }
                        uploaded.add(uploadedFile);
                    }

                    if (parentFile != null) {
                        fileRepository.save(parentFile);
                    }
                }
            } catch (Exception e) {

                for (var multipartFile : files) {
                    failedToUpload.add(FileOperationFailureDetails.from(multipartFile, e));
                }
            }
        } else {

            for (var multipartFile : files) {
                var fileName = multipartFile.getOriginalFilename();

                if (uploadedFileNames.contains(fileName)) {
                    continue;
                }

                var filePath =
                        Paths.get(rootPath, parentPath, fileName).toString().replace("\\", "/");

                try {
                    File uploadFile = uploadFileInCloud(
                            request, multipartFile, filePath, parentFile, fileName, patientDoctorOrganization);

                    uploadFile = fileRepository.save(uploadFile);
                    if (parentFile != null) parentFile.addChildFile(uploadFile);

                    uploaded.add(uploadFile);
                    uploadedFileNames.add(fileName);
                } catch (Exception e) {
                    failedToUpload.add(FileOperationFailureDetails.from(multipartFile, e));
                }
            }

            if (parentFile != null) {
                fileRepository.save(parentFile);
            }
        }

        if (!uploaded.isEmpty()) {
            createTimelineEventFiles(request, isPatientUploading, uploaderUserType, parentPath);
        }

        return FileUploadDetails.from(uploaded, failedToUpload);
    }

    @Transactional(noRollbackFor = BusinessException.class)
    @Override
    public FileUploadDetails uploadFilesToS3Only(
            UploadFilesRequest request, MultipartFile[] files, Boolean isPatientUploading) {
        var uploaderUserType = request.getUploader().getUserType();
        var parentPath = request.getParentPath();

        if (!List.of(UserType.DOCTOR, PATIENT).contains(uploaderUserType)) {
            throw new BadRequestException("Only doctor or patient are allowed to upload files");
        }

        var rootPathUser = getRootPathUser(request.getUploader(), request.getOwners());
        var rootPath =
                rootPath(rootPathUser.getUserId(), rootPathUser.getUserType()).replace("\\", "/");
        var parentFullPath = Paths.get(rootPath, parentPath).toString().replace("\\", "/");
        File parentFile = null;

        if (!parentFullPath.equals(rootPath)) {
            Optional<File> fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), parentFullPath);
            if (fileOptional.isEmpty()) {
                var fullNameRoot = fullNameRootPath(rootPathUser.getUserId(), rootPathUser.getUserType())
                        .replace("\\", "/");
                var fullNameParentFullPath =
                        Paths.get(fullNameRoot, parentPath).toString().replace("\\", "/");
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), fullNameParentFullPath);
                if (fileOptional.isPresent()) {
                    rootPath = fullNameRoot;
                    parentFullPath = fullNameParentFullPath;
                }
            }

            if (fileOptional.isEmpty()) {
                var idRoot = patientIdRootPath(rootPathUser.getUserId(), rootPathUser.getUserType())
                        .replace("\\", "/");
                var idParentFullPath = Paths.get(idRoot, parentPath).toString().replace("\\", "/");
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), idParentFullPath);
                if (fileOptional.isPresent()) {
                    rootPath = idRoot;
                    parentFullPath = idParentFullPath;
                }
            }

            if (fileOptional.isEmpty()) {
                log.info(
                        "Parent folder not found for S3 upload, auto-creating folder hierarchy for path: {}",
                        parentPath);
                createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                        .path(parentPath)
                        .uploader(request.getUploader())
                        .owners(request.getOwners())
                        .isDefaultFolder(false)
                        .isPatientFolder(false)
                        .build());
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), parentFullPath);
            }

            String finalParentFullPath = parentFullPath;
            parentFile = fileOptional.orElseThrow(() -> new InvalidFullPathException(finalParentFullPath));
        }

        if (parentFile != null && !parentFile.isFolder()) {
            throw new ParentFileNotFoundException(parentPath);
        }

        var failedToUpload = new ArrayList<FileOperationFailureDetails>();
        var uploaded = new ArrayList<File>();
        Set<String> uploadedFileNames = new HashSet<>();

        var patientOwner = request.getOwners().stream()
                .filter(owner -> owner.getUserType() == PATIENT)
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Patient owner is required"));

        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patientOwner.getUserId())
                .orElseThrow(() -> new BadRequestException("Patient doctor organization not found"));

        for (var multipartFile : files) {
            var fileName = multipartFile.getOriginalFilename();

            if (uploadedFileNames.contains(fileName)) {
                continue;
            }

            var filePath = Paths.get(rootPath, parentPath, fileName).toString().replace("\\", "/");

            try {
                File uploadFile = uploadFileInCloudS3(
                        request, multipartFile, filePath, parentFile, fileName, patientDoctorOrganization);

                uploadFile = fileRepository.save(uploadFile);
                if (parentFile != null) parentFile.addChildFile(uploadFile);

                uploaded.add(uploadFile);
                uploadedFileNames.add(fileName);
            } catch (Exception e) {
                failedToUpload.add(FileOperationFailureDetails.from(multipartFile, e));
            }
        }

        if (parentFile != null) {
            fileRepository.save(parentFile);
        }

        if (!uploaded.isEmpty()) {
            createTimelineEventFiles(request, isPatientUploading, uploaderUserType, parentPath);
        }
        return FileUploadDetails.from(uploaded, failedToUpload);
    }

    private void createTimelineEventFiles(
            UploadFilesRequest request, Boolean isPatientUploading, UserType uploaderUserType, String parentPath) {
        if (isPatientUploading != null
                && isPatientUploading
                && uploaderUserType == PATIENT
                && request.getOwners().stream().anyMatch(owner -> owner.getUserType() == UserType.DOCTOR)
                && request.getOwners().stream().anyMatch(owner -> owner.getUserType() == PATIENT)) {
            var userId = request.getOwners().stream()
                    .filter(owner -> owner.getUserType() == UserType.DOCTOR)
                    .findFirst();
            request.getOwners().stream()
                    .filter(owner -> owner.getUserType() == PATIENT)
                    .findFirst()
                    .map(UserId::getUserId)
                    .ifPresent(patientId -> {
                        Patient patient = patientRepository
                                .findById(patientId)
                                .orElseThrow(
                                        () -> new PatientNotFoundException("Patient not found with ID: " + patientId));
                        if (userId.isPresent()) {
                            var doctorDetails =
                                    doctorService.getDoctor(userId.get().getUserId());
                            notificationService.notificationForPhotosUploadedByPatient(doctorDetails, patient);
                            timelineService.addEvent(
                                    patient.getId(),
                                    PATIENT,
                                    patient.getAddedByUserId(),
                                    UserType.DOCTOR,
                                    EventType.PHOTO_ADDED_BY_PATIENT,
                                    new PatientAddedPhotoEventMetadata(patient.getId(), parentPath));
                        }
                    });
        }
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public FileUploadDetails uploadFilesFromChat(
            UploadFilesRequest request, MultipartFile[] files, Boolean isPatientUploading) {
        var uploaderUserId = request.getUploader().getUserId();
        var uploaderUserType = request.getUploader().getUserType();
        var parentPath = request.getParentPath();

        if (!List.of(UserType.DOCTOR, PATIENT).contains(uploaderUserType)) {
            throw new BadRequestException("Only doctor or patient are allowed to upload files");
        }

        var rootPathUser = getRootPathUser(request.getUploader(), request.getOwners());
        var rootPath =
                rootPath(rootPathUser.getUserId(), rootPathUser.getUserType()).replace("\\", "/");
        var parentFullPath = Paths.get(rootPath, parentPath).toString().replace("\\", "/");
        File parentFile = null;

        if (!parentFullPath.equals(rootPath)) {
            Optional<File> fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), parentFullPath);

            if (fileOptional.isEmpty()) {
                var fullNameRoot = fullNameRootPath(rootPathUser.getUserId(), rootPathUser.getUserType())
                        .replace("\\", "/");
                var fullNameParentFullPath =
                        Paths.get(fullNameRoot, parentPath).toString().replace("\\", "/");
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), fullNameParentFullPath);
                if (fileOptional.isPresent()) {
                    rootPath = fullNameRoot;
                    parentFullPath = fullNameParentFullPath;
                }
            }

            if (fileOptional.isEmpty()) {
                var idRoot = patientIdRootPath(rootPathUser.getUserId(), rootPathUser.getUserType())
                        .replace("\\", "/");
                var idParentFullPath = Paths.get(idRoot, parentPath).toString().replace("\\", "/");
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), idParentFullPath);
                if (fileOptional.isPresent()) {
                    rootPath = idRoot;
                    parentFullPath = idParentFullPath;
                }
            }

            if (fileOptional.isEmpty()) {
                log.info(
                        "Parent folder not found for chat upload, auto-creating folder hierarchy for path: {}",
                        parentPath);
                createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                        .path(parentPath)
                        .uploader(request.getUploader())
                        .owners(request.getOwners())
                        .isDefaultFolder(false)
                        .isPatientFolder(false)
                        .build());
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), parentFullPath);
            }

            String finalParentFullPath = parentFullPath;
            parentFile = fileOptional.orElseThrow(() -> new InvalidFullPathException(finalParentFullPath));
        }

        if (parentFile != null && !parentFile.isFolder()) {
            throw new ParentFileNotFoundException(parentPath);
        }

        var failedToUpload = new ArrayList<FileOperationFailureDetails>();
        var uploaded = new ArrayList<File>();
        Set<String> uploadedFileNames = new HashSet<>();

        for (var multipartFile : files) {
            var fileName = multipartFile.getOriginalFilename();

            if (uploadedFileNames.contains(fileName)) {
                log.warn("Duplicate file {} not uploaded", fileName);
                continue;
            }

            var filePath = Paths.get(rootPath, parentPath, fileName).toString();

            try {
                var patientOwner = request.getOwners().stream()
                        .filter(owner -> owner.getUserType() == PATIENT)
                        .findFirst()
                        .orElseThrow(() -> new BadRequestException("Patient owner is required"));

                var patientDoctorOrganization = patientDoctorOrganizationRepository
                        .findPatientDoctorOrganizationsWithPatientByPatientId(patientOwner.getUserId())
                        .orElseThrow(() -> new BadRequestException("Patient doctor organization not found"));

                File uploadFile = uploadFileInCloud(
                        request, multipartFile, filePath, parentFile, fileName, patientDoctorOrganization);

                GDriveStatus gDriveStatus = gDrivePlatformProvider.getGDriveStatus(patientDoctorOrganization);
                boolean isEnabled = gDriveStatus.enabled;
                UserProfile userProfile = gDriveStatus.userProfile;

                if (isEnabled) {
                    if (patientDoctorOrganization.getPatient() != null
                            && patientDoctorOrganization.getPatient().getEmail() != null
                            && !patientDoctorOrganization
                                    .getPatient()
                                    .getEmail()
                                    .isEmpty()) {
                        try {
                            driveService.shareFile(
                                    userProfile.getId(),
                                    uploadFile.getFullPath(),
                                    List.of(patientDoctorOrganization
                                            .getPatient()
                                            .getEmail()),
                                    "reader",
                                    uploadFile.getDriveFileId());
                        } catch (Exception ignored) {

                        }
                    }
                }

                Set<HasShared> newSet = new HashSet<>(uploadFile.getSharedWith());
                newSet.add(HasShared.PATIENT);
                uploadFile.setSharedWith(newSet);
                uploadFile = fileRepository.save(uploadFile);
                if (parentFile != null) parentFile.addChildFile(uploadFile);

                uploaded.add(uploadFile);
                uploadedFileNames.add(fileName);
            } catch (Exception e) {
                failedToUpload.add(FileOperationFailureDetails.from(multipartFile, e));
            }
        }
        if (parentFile != null) {
            fileRepository.save(parentFile);
        }

        if (!failedToUpload.isEmpty()) {
            log.warn(
                    "Failed to upload {} files from {} with id {}",
                    failedToUpload.size(),
                    uploaderUserType,
                    uploaderUserId);
        }

        if (isPatientUploading != null
                && isPatientUploading
                && uploaderUserType == PATIENT
                && request.getOwners().stream().anyMatch(owner -> owner.getUserType() == UserType.DOCTOR)
                && request.getOwners().stream().anyMatch(owner -> owner.getUserType() == PATIENT)) {
            var userId = request.getOwners().stream()
                    .filter(owner -> owner.getUserType() == UserType.DOCTOR)
                    .findFirst();
            request.getOwners().stream()
                    .filter(owner -> owner.getUserType() == PATIENT)
                    .findFirst()
                    .map(UserId::getUserId)
                    .ifPresent(patientId -> {
                        Patient patient = patientRepository
                                .findById(patientId)
                                .orElseThrow(
                                        () -> new PatientNotFoundException("Patient not found with ID: " + patientId));
                        timelineService.addEvent(
                                patient.getId(),
                                PATIENT,
                                patient.getAddedByUserId(),
                                UserType.DOCTOR,
                                EventType.PHOTO_ADDED_BY_PATIENT,
                                new PatientAddedPhotoEventMetadata(patient.getId(), parentPath));
                    });
        }
        return FileUploadDetails.from(uploaded, failedToUpload);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public FileUploadDetails uploadAlignerJourneyFiles(
            UploadFilesRequest request,
            MultipartFile[] files,
            Boolean isPatientUploading,
            Boolean isVideoToDisplayToPatient) {
        var uploaderUserId = request.getUploader().getUserId();
        var uploaderUserType = request.getUploader().getUserType();
        var parentPath = request.getParentPath();

        if (!List.of(UserType.DOCTOR, PATIENT).contains(uploaderUserType)) {
            throw new BadRequestException("Only doctor or patient are allowed to upload files");
        }

        var rootPathUser = getRootPathUser(request.getUploader(), request.getOwners());
        var rootPath =
                rootPath(rootPathUser.getUserId(), rootPathUser.getUserType()).replace("\\", "/");
        var parentFullPath = Paths.get(rootPath, parentPath).toString().replace("\\", "/");
        File parentFile = null;

        if (!parentFullPath.equals(rootPath)) {
            Optional<File> fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), parentFullPath);

            if (fileOptional.isEmpty()) {
                var fullNameRoot = fullNameRootPath(rootPathUser.getUserId(), rootPathUser.getUserType())
                        .replace("\\", "/");
                var fullNameParentFullPath =
                        Paths.get(fullNameRoot, parentPath).toString().replace("\\", "/");
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), fullNameParentFullPath);
                if (fileOptional.isPresent()) {
                    rootPath = fullNameRoot;
                    parentFullPath = fullNameParentFullPath;
                }
            }

            if (fileOptional.isEmpty()) {
                var idRoot = patientIdRootPath(rootPathUser.getUserId(), rootPathUser.getUserType())
                        .replace("\\", "/");
                var idParentFullPath = Paths.get(idRoot, parentPath).toString().replace("\\", "/");
                fileOptional = getFile(rootPathUser.getUserId(), rootPathUser.getUserType(), idParentFullPath);
                if (fileOptional.isPresent()) {
                    rootPath = idRoot;
                    parentFullPath = idParentFullPath;
                }
            }

            String finalParentFullPath = parentFullPath;
            parentFile = fileOptional.orElseThrow(() -> new InvalidFullPathException(finalParentFullPath));
        }

        if (parentFile != null && !parentFile.isFolder()) {
            throw new ParentFileNotFoundException(parentPath);
        }

        var failedToUpload = new ArrayList<FileOperationFailureDetails>();
        var uploaded = new ArrayList<File>();
        Set<String> uploadedFileNames = new HashSet<>();

        var patientOwner = request.getOwners().stream()
                .filter(owner -> owner.getUserType() == PATIENT)
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Patient owner is required"));

        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patientOwner.getUserId())
                .orElseThrow(() -> new BadRequestException("Patient doctor organization not found"));

        GDriveStatus gDriveStatus = gDrivePlatformProvider.getGDriveStatus(patientDoctorOrganization);
        boolean isGDriveEnabled = gDriveStatus.enabled;
        UserProfile userProfile = gDriveStatus.userProfile;

        if (isGDriveEnabled) {

            try {

                List<MultipartFile> uniqueFiles = new ArrayList<>();
                for (var multipartFile : files) {
                    var fileName = multipartFile.getOriginalFilename();
                    if (!uploadedFileNames.contains(fileName)) {
                        uniqueFiles.add(multipartFile);
                        uploadedFileNames.add(fileName);
                    } else {
                        log.warn("Duplicate file {} not uploaded", fileName);
                    }
                }

                if (!uniqueFiles.isEmpty()) {

                    List<File> uploadedFiles = uploadMultipleFileInCloud(
                            request,
                            uniqueFiles.toArray(new MultipartFile[0]),
                            rootPath,
                            parentPath,
                            parentFile,
                            patientDoctorOrganization);

                    for (File uploadedFile : uploadedFiles) {

                        if (patientDoctorOrganization.getPatient() != null
                                && patientDoctorOrganization.getPatient().getEmail() != null
                                && !patientDoctorOrganization
                                        .getPatient()
                                        .getEmail()
                                        .isEmpty()) {
                            try {
                                driveService.shareFile(
                                        userProfile.getId(),
                                        uploadedFile.getFullPath(),
                                        List.of(patientDoctorOrganization
                                                .getPatient()
                                                .getEmail()),
                                        "reader",
                                        uploadedFile.getDriveFileId());
                            } catch (Exception ignored) {

                            }
                        }

                        Set<HasShared> newSet = new HashSet<>(uploadedFile.getSharedWith());
                        newSet.add(HasShared.PATIENT);
                        uploadedFile.setSharedWith(newSet);
                        uploadedFile.setFilesFromTreatmentPlan(true);
                        uploadedFile.setFileDisplayToPatient(isVideoToDisplayToPatient);

                        uploadedFile = fileRepository.save(uploadedFile);
                        if (parentFile != null) {
                            parentFile.addChildFile(uploadedFile);
                        }
                        uploaded.add(uploadedFile);
                    }

                    if (parentFile != null) {
                        fileRepository.save(parentFile);
                    }
                }
            } catch (Exception e) {
                log.error("Batch upload to Google Drive failed", e);

                for (var multipartFile : files) {
                    failedToUpload.add(FileOperationFailureDetails.from(multipartFile, e));
                }
            }
        } else {

            for (var multipartFile : files) {
                var fileName = multipartFile.getOriginalFilename();

                if (uploadedFileNames.contains(fileName)) {
                    log.warn("Duplicate file {} not uploaded", fileName);
                    continue;
                }

                var filePath = Paths.get(rootPath, parentPath, fileName).toString();

                try {
                    File uploadFile = uploadFileInCloud(
                            request, multipartFile, filePath, parentFile, fileName, patientDoctorOrganization);

                    Set<HasShared> newSet = new HashSet<>(uploadFile.getSharedWith());
                    newSet.add(HasShared.PATIENT);
                    uploadFile.setSharedWith(newSet);
                    uploadFile.setFilesFromTreatmentPlan(true);
                    uploadFile.setFileDisplayToPatient(isVideoToDisplayToPatient);

                    uploadFile = fileRepository.save(uploadFile);
                    if (parentFile != null) parentFile.addChildFile(uploadFile);

                    uploaded.add(uploadFile);
                    uploadedFileNames.add(fileName);
                } catch (Exception e) {
                    failedToUpload.add(FileOperationFailureDetails.from(multipartFile, e));
                }
            }

            if (parentFile != null) {
                fileRepository.save(parentFile);
            }
        }

        if (!uploaded.isEmpty()) {
            log.info("Uploaded {} files from {} with id {}", uploaded.size(), uploaderUserType, uploaderUserId);

            createTimelineEventFiles(request, isPatientUploading, uploaderUserType, parentPath);
        }
        if (!failedToUpload.isEmpty()) {
            log.warn(
                    "Failed to upload {} files from {} with id {}",
                    failedToUpload.size(),
                    uploaderUserType,
                    uploaderUserId);
        }
        return FileUploadDetails.from(uploaded, failedToUpload);
    }

    private File uploadFileInCloud(
            UploadFilesRequest request,
            MultipartFile multipartFile,
            String filePath,
            File parentFile,
            String fileName,
            PatientDoctorOrganization patientDoctorOrganization)
            throws Exception {

        GDriveStatus gDriveStatus = gDrivePlatformProvider.getGDriveStatus(patientDoctorOrganization);
        boolean isEnabled = gDriveStatus.enabled;
        UserProfile userProfile = gDriveStatus.userProfile;

        UploadedChunkContext details = null;
        String url = "";
        String newPath = filePath.replace("\\", "/");
        if (isEnabled) {
            String[] parts = filePath.split("/");
            newPath = filePath.substring(0, filePath.lastIndexOf('/') + 1) + IDGenerator.generateDriveStyleId() + "_"
                    + parts[parts.length - 1];

            details = optimizedDriveService.storeFileOptimized(userProfile.getId(), newPath, multipartFile, true);
        } else {
            url = amazonS3Service.storeFile(filesBucket, newPath, multipartFile);
        }

        File uploadFile;
        if (details != null) {
            uploadFile = File.newFile(
                    request.getUploader(),
                    request.getOwners(),
                    fileName,
                    newPath,
                    details.getUrl(),
                    details.getThumbnailUrl(),
                    details.getDownloadUrl(),
                    parentFile,
                    multipartFile.getSize(),
                    userProfile,
                    isEnabled,
                    details.getDriveFileId());
        } else {
            uploadFile = File.newFile(
                    request.getUploader(),
                    request.getOwners(),
                    fileName,
                    newPath,
                    url,
                    null,
                    null,
                    parentFile,
                    multipartFile.getSize(),
                    userProfile,
                    isEnabled,
                    null);
        }

        return uploadFile;
    }

    private File uploadFileInCloudS3(
            UploadFilesRequest request,
            MultipartFile multipartFile,
            String filePath,
            File parentFile,
            String fileName,
            PatientDoctorOrganization patientDoctorOrganization)
            throws Exception {

        String newPath = filePath.replace("\\", "/");
        String url = amazonS3Service.storeFile(filesBucket, newPath, multipartFile);

        GDriveStatus gDriveStatus = gDrivePlatformProvider.getGDriveStatus(patientDoctorOrganization);
        UserProfile userProfile = gDriveStatus.userProfile;

        return File.newFile(
                request.getUploader(),
                request.getOwners(),
                fileName,
                newPath,
                url,
                null,
                null,
                parentFile,
                multipartFile.getSize(),
                userProfile,
                false,
                null);
    }

    private List<File> uploadMultipleFileInCloud(
            UploadFilesRequest request,
            MultipartFile[] files,
            String rootPath,
            String parentPath,
            File parentFile,
            PatientDoctorOrganization patientDoctorOrganization)
            throws Exception {
        GDriveStatus gDriveStatus = gDrivePlatformProvider.getGDriveStatus(patientDoctorOrganization);
        boolean isEnabled = gDriveStatus.enabled;
        UserProfile userProfile = gDriveStatus.userProfile;

        List<UploadedChunkContext> details = new ArrayList<>();

        if (isEnabled) {

            Map<String, MultipartFile> filePathMap = new HashMap<>();
            for (MultipartFile file : files) {
                String fileName = file.getOriginalFilename();
                String newPath = Paths.get(rootPath, parentPath, IDGenerator.generateDriveStyleId() + "_" + fileName)
                        .toString()
                        .replace("\\", "/");
                filePathMap.put(newPath, file);
            }

            details.addAll(optimizedDriveService.uploadMultipleFileOptimized(
                    userProfile.getId(),
                    Paths.get(rootPath, parentPath).toString().replace("\\", "/"),
                    files,
                    true));

            if (patientDoctorOrganization.getUserProfile() != null
                    && patientDoctorOrganization.getUserProfile().getUser() != null) {
                List<String> customerEmail = List.of(
                        patientDoctorOrganization.getUserProfile().getUser().getEmail());
                details.forEach(d -> {
                    try {
                        driveService.shareFile(userProfile.getId(), null, customerEmail, "reader", d.getDriveFileId());
                    } catch (Exception ignored) {
                        log.info("unable to share file {} with email {}", d.getFileName(), customerEmail);
                    }
                });
            }
        } else {

            for (MultipartFile file : files) {
                String fileName = file.getOriginalFilename();
                String filePath =
                        Paths.get(rootPath, parentPath, fileName).toString().replace("\\", "/");
                String url = amazonS3Service.storeFile(filesBucket, filePath, file);
                details.add(UploadedChunkContext.builder()
                        .url(url)
                        .fileName(fileName)
                        .size(file.getSize())
                        .build());
            }
        }

        Map<String, MultipartFile> filesByName = new HashMap<>();
        for (MultipartFile file : files) {
            filesByName.put(file.getOriginalFilename(), file);
        }

        List<File> uploadedFiles = new ArrayList<>();
        for (UploadedChunkContext uploadedContext : details) {
            String fileName = uploadedContext.getFileName();

            MultipartFile originalFile = filesByName.get(fileName);
            long fileSize = (originalFile != null)
                    ? originalFile.getSize()
                    : (uploadedContext.getSize() != null ? uploadedContext.getSize() : 0L);

            String baseFileName = fileName;
            if (fileName.contains("/")) {
                baseFileName = fileName.substring(fileName.lastIndexOf("/") + 1);
            }

            String fullPath =
                    Paths.get(rootPath, parentPath, baseFileName).toString().replace("\\", "/");

            File fileDetails = File.newFile(
                    request.getUploader(),
                    request.getOwners(),
                    baseFileName,
                    fullPath,
                    uploadedContext.getUrl(),
                    uploadedContext.getThumbnailUrl(),
                    uploadedContext.getDownloadUrl(),
                    parentFile,
                    fileSize,
                    userProfile,
                    isEnabled,
                    uploadedContext.getDriveFileId());

            uploadedFiles.add(fileDetails);
        }

        return uploadedFiles;
    }

    @Override
    public Optional<File> getFile(long ownerUserId, UserType ownerUserType, String fullPath) {
        if (fullPath.equals("/")) {
            return Optional.empty();
        }
        if (fullPath.contains("Pre treatment photos")) {
            List<File> files = fileRepository.findByOwnerUserIdAndOwnerUserTypeAndFullPathAndStatusPreTreatment(
                    ownerUserId, ownerUserType, fullPath, Status.ACTIVE);
            if (files.isEmpty()) {
                return Optional.empty();
            } else {
                return Optional.ofNullable(files.get(0));
            }
        } else {
            return fileRepository.findByOwnerUserIdAndOwnerUserTypeAndFullPathAndStatus(
                    ownerUserId, ownerUserType, fullPath, Status.ACTIVE);
        }
    }

    public UserId getRootPathUser(UserId uploader, Set<UserId> owners) {

        if (uploader.getUserType().equals(PATIENT)) {
            return uploader;
        }

        for (var o : owners) {
            if (o.getUserType().equals(PATIENT)) {
                return o;
            }
        }

        return uploader;
    }

    @Override
    public String rootPath(long userId, @NotNull UserType userType) {
        Patient patient = patientRepository.findById(userId).orElse(null);
        if (patient != null) {
            return Paths.get(userType.name().toLowerCase(), userId + "_" + patient.tagFirstName(), FILES_FOLDER_NAME)
                    .toString();
        } else {
            return Paths.get(userType.name().toLowerCase(), String.valueOf(userId), FILES_FOLDER_NAME)
                    .toString();
        }
    }

    public String fullNameRootPath(long userId, @NotNull UserType userType) {
        Patient patient = patientRepository.findById(userId).orElse(null);
        if (patient != null) {
            return Paths.get(userType.name().toLowerCase(), userId + "_" + patient.tagFullName(), FILES_FOLDER_NAME)
                    .toString();
        } else {
            return Paths.get(userType.name().toLowerCase(), String.valueOf(userId), FILES_FOLDER_NAME)
                    .toString();
        }
    }

    public String patientIdRootPath(long userId, @NotNull UserType userType) {
        return Paths.get(userType.name().toLowerCase(), String.valueOf(userId), FILES_FOLDER_NAME)
                .toString();
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public void renameFile(long fileId, String newName) {
        File file = fileRepository.findByFileId(fileId).orElseThrow(() -> new FileNotFoundException(fileId));
        if (file.isFolder()) {
            renameFolder(file, newName);
        } else {
            renameFile(file, newName);
        }
    }

    private void renameFile(File file, String newName) {
        var fileId = file.getId();
        var uploaderUserId = file.getUploaderUserId();
        var uploaderUserType = file.getUploaderUserType();
        var oldFullPath = file.getFullPath();

        var newFullPath =
                Paths.get(file.getFullPath()).getParent().resolve(newName).toString();
        if (getFile(uploaderUserId, uploaderUserType, newFullPath).isPresent()) {
            throw new FileAlreadyExistsException(uploaderUserId, uploaderUserType, newFullPath);
        }

        try {
            var newUrl = amazonS3Service.moveFile(filesBucket, oldFullPath, newFullPath);
            file.setFullPath(newFullPath);
            file.setName(newName);
            file.setUrl(newUrl);
            fileRepository.save(file);
        } catch (AmazonServiceException e) {
            throw new FailedToMoveFileException(fileId, oldFullPath, newFullPath);
        }
    }

    @Override
    @Transactional
    public void moveFile(MoveFileRequest request) {
        var requesterUserId = request.getRequesterUserId();
        var requesterUserType = request.getRequesterUserType();
        var fileId = request.getFileId();
        var newParentPath = request.getNewParentPath();
        var file = fileRepository.findById(fileId).orElseThrow(() -> new FileNotFoundException(fileId));
        moveFile(file, requesterUserId, requesterUserType, newParentPath);
    }

    private void moveFile(File file, long requesterUserId, UserType requesterUserType, String newParentPath) {
        var uploaderUserId = file.getUploaderUserId();
        var uploaderUserType = file.getUploaderUserType();
        var oldFullPath = file.getFullPath();
        var oldParentFile = file.getParentFile();
        var userId = UserId.builder()
                .userId(uploaderUserId)
                .userType(uploaderUserType)
                .build();
        var fileOwners = file.getOwners();
        Set<UserId> owners = new HashSet<>();

        for (FileOwner fileOwner : fileOwners) {
            var owner = UserId.builder()
                    .userId(fileOwner.getUserId())
                    .userType(fileOwner.getUserType())
                    .build();
            owners.add(owner);
        }

        var rootPathUser = getRootPathUser(userId, owners);

        var rootPath = rootPath(rootPathUser.getUserId(), rootPathUser.getUserType());
        var fileId = file.getId();
        var parentFullPath = Paths.get(rootPath, newParentPath).toString();
        File newParentFile = null;
        if (!parentFullPath.equals(rootPath)) {
            newParentFile = getFile(requesterUserId, requesterUserType, parentFullPath)
                    .orElseThrow(() -> new InvalidFullPathException(parentFullPath));
        }
        var newFullPath = Paths.get(parentFullPath, file.getName()).toString();
        if (newParentFile != null && !newParentFile.isFolder()) {
            throw new ParentFileNotFoundException(newParentPath);
        }

        var requiredPerms = List.of(FilePermissionType.WRITE);
        if (newParentFile != null
                && !hasPermissions(newParentFile, requesterUserId, requesterUserType, requiredPerms, null)) {
            throw new InvalidFilePermissionsException(newParentFile, requesterUserId, requesterUserType, requiredPerms);
        }
        if (!hasPermissions(file, requesterUserId, requesterUserType, requiredPerms, null)) {
            throw new InvalidFilePermissionsException(file, requesterUserId, requesterUserType, requiredPerms);
        }

        try {
            var newUrl = amazonS3Service.moveFile(filesBucket, oldFullPath, newFullPath);
            file.setFullPath(newFullPath);
            file.setUrl(newUrl);
            file.setParentFile(newParentFile);
            file = fileRepository.save(file);

            if (oldParentFile != null) {
                oldParentFile.removeChildFile(file);
                fileRepository.save(oldParentFile);
            }
            if (newParentFile != null) {
                newParentFile.addChildFile(file);
                fileRepository.save(newParentFile);
            }
        } catch (AmazonServiceException e) {
            throw new FailedToMoveFileException(fileId, oldFullPath, newFullPath);
        }
    }

    @Override
    @Transactional
    public MoveFilesDetails moveFiles(MoveFilesRequest request) {
        List<File> movedFiles = new ArrayList<>();
        List<FileOperationFailureDetails> failedToMove = new ArrayList<>();
        for (var fileId : request.getFileIds()) {
            var file = fileRepository.findById(fileId).orElseThrow(() -> new FileNotFoundException(fileId));
            try {
                moveFile(
                        file, request.getRequesterUserId(), request.getRequesterUserType(), request.getNewParentPath());
                movedFiles.add(file);
            } catch (FailedToMoveFileException e) {
                failedToMove.add(FileOperationFailureDetails.from(file, e));
            }
        }

        return new MoveFilesDetails(movedFiles, failedToMove);
    }

    private void renameFolder(File folder, String newName) {
        var uploaderUserId = folder.getUploaderUserId();
        var uploaderUserType = folder.getUploaderUserType();
        var oldFullPath = folder.getFullPath();
        var folderId = folder.getId();

        var newFullPath =
                Paths.get(folder.getFullPath()).getParent().resolve(newName).toString();
        if (getFile(uploaderUserId, uploaderUserType, newFullPath).isPresent()) {
            throw new FileAlreadyExistsException(uploaderUserId, uploaderUserType, newFullPath);
        }

        try {
            boolean isEnabled = gDrivePlatformProvider.isGDrivePlatformEnabled(
                    folder.getUserProfile().getDoctor().getId(),
                    folder.getUserProfile().getId());

            Map<String, AmazonS3ServiceImpl.RenamedFileDetails> renameDetails;
            if (isEnabled) {
                renameDetails =
                        driveService.renameFolder(folder.getUserProfile().getId(), oldFullPath, newName);
            } else {
                renameDetails = amazonS3Service.renameFolder(filesBucket, oldFullPath, newName);
            }

            folder.setFullPath(newFullPath);
            folder.setName(newName);
            fileRepository.save(folder);

            for (var oldKey : renameDetails.keySet()) {
                var details = renameDetails.get(oldKey);
                var optionalFile = fileRepository.findByFullPath(oldKey);

                if (optionalFile.isEmpty() && oldKey.endsWith("/")) {
                    optionalFile = fileRepository.findByFullPath(oldKey.substring(0, oldKey.length() - 1));
                }

                if (optionalFile.isEmpty()) {
                    log.warn("File with full path {} not found while renaming folder.", oldKey);
                    continue;
                }

                var file = optionalFile.get();
                file.setFullPath(details.newKey());
                file.setUrl(details.newUrl());
                fileRepository.save(file);
            }
            log.info("Successfully renamed a folder with id {}", folderId);
        } catch (AmazonServiceException e) {
            throw new FailedToMoveFileException(folderId, oldFullPath, newFullPath);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public FileDownloadDetails downloadFile(DownloadFileRequest request) {
        var requesterUserId = request.getRequesterUserId();
        var requesterUserType = request.getRequesterUserType();
        var fileId = request.getFileId();
        var file = fileRepository.findByFileId(fileId).orElseThrow(() -> new FileNotFoundException(fileId));

        if (file.getCloneFromFileId() != null) {
            var cloneFromFileId = file.getCloneFromFileId();
            file = fileRepository
                    .findById(cloneFromFileId)
                    .orElseThrow(() -> new FileNotFoundException(cloneFromFileId));
        }

        var actualFileId = file.getId();

        try {
            byte[] content;
            if (file.isFolder()) {
                boolean isEnabled = gDrivePlatformProvider.isGDrivePlatformEnabled(
                        file.getUserProfile().getDoctor().getId(),
                        file.getUserProfile().getId());

                if (isEnabled) {
                    content = driveService.downloadFolder(
                            file.getUserProfile().getId(), file.getFullPath(), file.getName(), file.getDriveFileId());
                } else {
                    content = amazonS3Service.downloadFolder(filesBucket, file.getFullPath(), file.getName());
                }
            } else {
                boolean isEnabled = gDrivePlatformProvider.isGDrivePlatformEnabled(
                        file.getUserProfile().getDoctor().getId(),
                        file.getUserProfile().getId());

                if (isEnabled) {
                    content = driveService.downloadFile(
                            file.getUserProfile().getId(), file.getFullPath(), file.getDriveFileId());
                } else {
                    content = amazonS3Service.downloadFile(filesBucket, file.getFullPath());
                }
            }

            if (content == null) {
                log.error("Got empty content from AWS for file {} in bucket {}", file.getFullPath(), filesBucket);
                throw new FailedToDownloadFileException(file);
            }

            log.info("File with id {} download by {} with id {}", actualFileId, requesterUserType, requesterUserId);
            return new FileDownloadDetails(file, new ByteArrayResource(content));
        } catch (IOException | AmazonServiceException | InterruptedException e) {
            throw new FailedToDownloadFileException(file);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    @Override
    public void createFolderIfNotExists(CreateFolderRequest request) {
        try {
            createFolder(request);
        } catch (FileAlreadyExistsException ignored) {

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    @Override
    public void createFolderHierarchy(CreateFolderHierarchyRequest request) {
        var path = Paths.get(request.getPath());
        var parentPath = Paths.get("/");
        for (var folderName : path) {
            createFolderIfNotExists(CreateFolderRequest.builder()
                    .folderName(folderName.getFileName().toString())
                    .parentPath(parentPath.toString())
                    .uploader(request.getUploader())
                    .owners(request.getOwners())
                    .isDefaultFolder(request.getIsDefaultFolder())
                    .isPatientFolder(request.getIsPatientFolder())
                    .build());
            parentPath = parentPath.resolve(folderName);
            if (parentPath.equals(path)) {
                break;
            }
        }
    }

    @Override
    @Transactional
    public Double calculateDoctorTotalFileSize(Long organizationId) {
        Long totalSizeInBytes = fileRepository.findTotalStorageSizeByOrganization(organizationId);
        if (totalSizeInBytes == null) {
            totalSizeInBytes = 0L;
        }
        return totalSizeInBytes / (1024.0 * 1024.0);
    }

    @Transactional(readOnly = true)
    @Override
    public List<FileDetails> getAllFileByIds(GetFilesRequest request) {
        List<File> files = fileRepository.findByIds(request.getFileIds());
        return files.stream().map(FileDetails::from).toList();
    }

    @Override
    public List<FileDetails> getAllFilesByNames(String[] imageUrls) {
        List<String> driveIds = new ArrayList<>();
        List<String> s3Urls = new ArrayList<>();

        for (String url : imageUrls) {
            if (url == null || url.isBlank()) {
                continue;
            }

            if (url.contains("/drive/")) {
                String[] parts = url.split("/");
                String driveId = parts[parts.length - 1];
                driveIds.add(driveId);
            } else {
                s3Urls.add(url);
            }
        }

        List<File> allFiles = new ArrayList<>();

        if (!s3Urls.isEmpty()) {
            allFiles.addAll(fileRepository.findByUrls(s3Urls));
        }

        if (!driveIds.isEmpty()) {
            allFiles.addAll(fileRepository.findByDriveFileIds(driveIds));
        }

        return allFiles.stream()
                .collect(Collectors.toMap(File::getId, Function.identity(), (a, b) -> a))
                .values()
                .stream()
                .map(FileDetails::from)
                .toList();
    }

    @Override
    public void toggleStlFileView(Long profileId) {
        Optional<UserProfile> userProfile = userProfileRepository.findById(profileId);
        userProfile.ifPresent((p) -> {
            p.setIsStlFileViewEnabled(!p.getIsStlFileViewEnabled());
            userProfileRepository.save(p);
        });
    }

    public boolean hasPermissions(
            File file,
            long userId,
            @NotNull UserType userType,
            List<FilePermissionType> requiredPermissions,
            Long organizationId) {
        var availablePerms = file.getFilePermissions().stream()
                .filter(perm -> perm.getUserId() == userId && perm.getUserType().equals(userType))
                .map(FilePermission::getPermission)
                .toList();

        if (organizationId != null) {
            List<UserProfile> userProfiles = userProfileRepository.findAllByOrganizationIdAndProfileTypeIn(
                    organizationId, List.of(ProfileType.MEMBER, ProfileType.OWNER));

            boolean hasOrgAccess = userProfiles.stream()
                    .anyMatch(userProfile -> userProfile.getDoctor().getId() == userId);

            if (hasOrgAccess) {
                availablePerms = List.of(FilePermissionType.READ);
            }
        }

        for (var requiredPerm : requiredPermissions) {
            if (!availablePerms.contains(requiredPerm)) {
                return false;
            }
        }

        return true;
    }
}
