package com.dentalstack.patient.feature.storage.drive.operation;

import com.dentalstack.patient.feature.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.storage.drive.config.GoogleDriveConfig;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.UploadedChunkContext;
import com.dentalstack.patient.feature.storage.drive.operation.impl.*;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.drive.util.GoogleDriveUtil;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.storage.files.dto.FileUploadDetails;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.s3.AmazonS3ServiceImpl;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.dto.UserId;
import com.google.api.services.drive.Drive;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleDriveServiceImpl implements GoogleDriveService {

    private final GoogleDriveConfig googleDriveConfig;
    private final UploadFileOperation uploadFileOperation;
    private final DeleteFileOperation deleteFileOperation;
    private final DownloadFileOperation downloadFileOperation;
    private final CreateFolderOperation createFolderOperation;
    private final CopyFileOperation copyFileOperation;
    private final MoveFileOperation moveFileOperation;
    private final RenameFolderOperation renameFolderOperation;
    private final DownloadFolderOperation downloadFolderOperation;
    private final GetFolderSizeOperation getFolderSizeOperation;
    private final GetFileOperation getFileOperation;
    private final ShareFileOperation shareFileOperation;
    private final UnShareFileOperation unShareFileOperation;
    private final PatientDoctorOrganizationRepository pdoRepository;
    private final GoogleDriveUtil googleDriveUtil;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;

    @Override
    public UploadedChunkContext storeFile(Long profileId, String path, MultipartFile file) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.UploadContext context = OperationContext.UploadContext.builder()
                .profileId(profileId)
                .path(path)
                .file(file)
                .build();

        return uploadFileOperation.execute(drive, context);
    }

    @Override
    public void deleteFile(Long profileId, String path) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.DeleteContext context = OperationContext.DeleteContext.builder()
                .profileId(profileId)
                .path(path)
                .build();

        deleteFileOperation.execute(drive, context);
    }

    @Override
    public String createFolder(Long profileId, String folderPath) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.FolderContext context = OperationContext.FolderContext.builder()
                .profileId(profileId)
                .path(folderPath)
                .build();

        return createFolderOperation.execute(drive, context);
    }

    @Override
    public String copyFile(Long profileId, String srcPath, String destPath) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.CopyContext context = OperationContext.CopyContext.builder()
                .profileId(profileId)
                .sourcePath(srcPath)
                .destinationPath(destPath)
                .build();

        return copyFileOperation.execute(drive, context);
    }

    @Override
    public String moveFile(Long profileId, String srcPath, String destPath) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.MoveContext context = OperationContext.MoveContext.builder()
                .profileId(profileId)
                .sourcePath(srcPath)
                .destinationPath(destPath)
                .build();

        return moveFileOperation.execute(drive, context);
    }

    @Override
    public Map<String, AmazonS3ServiceImpl.RenamedFileDetails> renameFolder(
            Long profileId, String folderPath, String newName) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.RenameFolderContext context = OperationContext.RenameFolderContext.builder()
                .profileId(profileId)
                .path(folderPath)
                .newName(newName)
                .build();

        return renameFolderOperation.execute(drive, context);
    }

    @Override
    public byte[] downloadFile(Long profileId, String path, String driveFileId) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.DownloadContext context = OperationContext.DownloadContext.builder()
                .profileId(profileId)
                .path(path)
                .driveFileId(driveFileId)
                .build();

        return downloadFileOperation.execute(drive, context);
    }

    @Override
    public byte[] downloadFolder(Long profileId, String folderPath, String zipName, String driveFileId)
            throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.DownloadFolderContext context = OperationContext.DownloadFolderContext.builder()
                .profileId(profileId)
                .path(folderPath)
                .zipName(zipName)
                .driveFileId(driveFileId)
                .build();

        return downloadFolderOperation.execute(drive, context);
    }

    @Override
    public double getFolderSizeInMB(Long profileId, String folderPath) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.FolderContext context = OperationContext.FolderContext.builder()
                .profileId(profileId)
                .path(folderPath)
                .build();

        return getFolderSizeOperation.execute(drive, context);
    }

    @Override
    public FileContent getFile(Long profileId, String path) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.DownloadContext context = OperationContext.DownloadContext.builder()
                .profileId(profileId)
                .path(path)
                .build();

        return getFileOperation.execute(drive, context);
    }

    @Override
    public void shareFile(Long profileId, String path, List<String> emails, String role, String driveFileId)
            throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.ShareContext context = OperationContext.ShareContext.builder()
                .profileId(profileId)
                .path(path)
                .emails(emails)
                .role(role)
                .driveFileId(driveFileId)
                .build();

        shareFileOperation.execute(drive, context);
    }

    @Override
    public void unShareFile(Long profileId, String path, List<String> emails, String driveFileId) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.UnShareContext context = OperationContext.UnShareContext.builder()
                .profileId(profileId)
                .path(path)
                .emails(emails)
                .driveFileId(driveFileId)
                .build();

        unShareFileOperation.execute(drive, context);
    }

    @Override
    public void unshareRestrictedFiles(
            UploadFilesRequest request, FileUploadDetails fileUploadDetails, Long profileId) {

        UserId patientUser = request.getOwners().stream()
                .filter(owner -> owner.getUserType() == UserType.PATIENT)
                .findFirst()
                .orElse(null);

        if (patientUser == null) {
            return;
        }

        PatientDoctorOrganization pdo = pdoRepository.findByPatientOwnerOrgAndUserProfile(patientUser.getUserId());

        if (pdo == null || pdo.getUserProfile().isOwner()) {
            return;
        }

        if (!googleDriveUtil.isGdriveEnabled(profileId) || googleDriveUtil.isCustomer(profileId)) {
            return;
        }

        Long ownerOrganizationId = pdo.getOrgUserProfile().getOrganization().getId();
        Long customerProfileId = pdo.getUserProfile().getId();

        Optional<CustomerAccessAndRevoke> optionalAccess =
                customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                        customerProfileId, ownerOrganizationId);

        if (optionalAccess.isEmpty()) {
            return;
        }

        CustomerAccessAndRevoke access = optionalAccess.get();
        String customerEmail = pdo.getUserProfile().getUser().getEmail();
        List<String> emails = List.of(customerEmail);

        for (FileDetails file : fileUploadDetails.getUploadFiles()) {
            String path = file.getFullPath();
            try {
                if (!Boolean.TRUE.equals(access.getIsScanFileViewEnabled()) && path.contains("3D Files/Scan files")) {
                    unShareFile(pdo.getOrgUserProfile().getId(), path, emails, null);
                }
                if (!Boolean.TRUE.equals(access.getIsPrintFileViewEnabled()) && path.contains("Orders/STL Treatment")) {
                    unShareFile(pdo.getOrgUserProfile().getId(), path, emails, null);
                }
            } catch (Exception e) {
                log.warn("Failed to unshare {}", path, e);
            }
        }
    }

    public String buildPath(Patient patient, String parentPath) {
        return "patient/" + patient.getId().toString() + "_" + patient.tagFirstName() + "/files/" + parentPath;
    }

    private Drive getDriveService(Long profileId) throws Exception {
        return googleDriveConfig.ensureValidDriveService(profileId);
    }
}
