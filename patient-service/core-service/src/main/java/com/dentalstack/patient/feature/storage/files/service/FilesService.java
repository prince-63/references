package com.dentalstack.patient.feature.storage.files.service;

import com.dentalstack.patient.feature.storage.files.domain.FileDownloadDetails;
import com.dentalstack.patient.feature.storage.files.domain.FileUploadDetails;
import com.dentalstack.patient.feature.storage.files.domain.MoveFilesDetails;
import com.dentalstack.patient.feature.storage.files.dto.*;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.exception.BusinessException;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

public interface FilesService {
    String FILES_FOLDER_NAME = "files";
    String DOCUMENTS_FOLDER_NAME = "Documents";
    String IMAGE_FOLDER_NAME = "Images";
    String TREATMENTS = "Treatments";
    String STL_FILES = "STL Files";

    String THREE_D_FOLDER_NAME = "3D Files";
    String PRINT_FILE_FOLDER_NAME = "Print files";
    String SCAN_FILE_FOLDER_NAME = "Scan files";
    String BRACES_FOLDER_NAME = "Braces";
    String PATIENT_COMMENT_FOLDER_NAME = "PatientComments";
    String CASE_INFO_FOLDER_NAME = "CaseInfo";
    String CHAT_FOLDER_NAME = "Chat";
    String ORDER_FOLDER_NAME = "Orders";
    String CLEAR_ALIGNERS = "Aligners";
    String ALIGNERS = "Aligner";

    String PRE_TREATMENT = "Pre treatment photos";

    String POST_TREATMENT = "Post treatment photos";

    void createFolder(CreateFolderRequest request) throws Exception;

    @Transactional(noRollbackFor = BusinessException.class)
    FileUploadDetails uploadFilesToS3Only(
            UploadFilesRequest request, MultipartFile[] files, Boolean isPatientUploading);

    @Transactional(noRollbackFor = BusinessException.class)
    FileUploadDetails uploadFilesFromChat(
            UploadFilesRequest request, MultipartFile[] files, Boolean isPatientUploading);

    @Transactional(noRollbackFor = BusinessException.class)
    FileUploadDetails uploadAlignerJourneyFiles(
            UploadFilesRequest request,
            MultipartFile[] files,
            Boolean isPatientUploading,
            Boolean isVideoToDisplayToPatient);

    Optional<File> getFile(long ownerUserId, @NotNull UserType ownerType, String path);

    double getSizeOfTheFolder(GetFolderSizeRequest request) throws Exception;

    UserFilesDetails getFiles(
            long requesterUserId,
            UserType requesterUserType,
            long ownerUserId,
            UserType ownerUserType,
            @NotNull String parentPath);

    void deleteFiles(DeleteFilesRequest request);

    @Transactional(rollbackFor = BusinessException.class)
    void deleteFilesById(DeleteFilesRequest request);

    FileUploadDetails uploadFiles(UploadFilesRequest request, MultipartFile[] files, Boolean isPatientUploading);

    String rootPath(long userId, @NotNull UserType userType);

    void renameFile(long fileId, String newName);

    void moveFile(MoveFileRequest request);

    MoveFilesDetails moveFiles(MoveFilesRequest request);

    FileDownloadDetails downloadFile(DownloadFileRequest request);

    void createFolderIfNotExists(CreateFolderRequest request);

    void createFolderHierarchy(CreateFolderHierarchyRequest request);

    Double calculateDoctorTotalFileSize(Long organizationId);

    List<FileDetails> getAllFileByIds(GetFilesRequest request);

    List<FileDetails> getAllFilesByNames(String[] imageUrls);

    void toggleStlFileView(Long profileId);
}
