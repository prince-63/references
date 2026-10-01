package com.dentalstack.patient.feature.storage.drive.service;

import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.UploadedChunkContext;
import com.dentalstack.patient.feature.storage.files.dto.FileUploadDetails;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.s3.AmazonS3ServiceImpl;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface GoogleDriveService {

    UploadedChunkContext storeFile(Long profileId, String path, MultipartFile file) throws Exception;

    void deleteFile(Long profileId, String path) throws Exception;

    String createFolder(Long profileId, String folderPath) throws Exception;

    String copyFile(Long profileId, String srcPath, String destPath) throws Exception;

    String moveFile(Long profileId, String srcPath, String destPath) throws Exception;

    Map<String, AmazonS3ServiceImpl.RenamedFileDetails> renameFolder(Long profileId, String folderPath, String newName)
            throws Exception;

    byte[] downloadFile(Long profileId, String path, String driveFileId) throws Exception;

    byte[] downloadFolder(Long profileId, String folderPath, String zipName, String driveFileId) throws Exception;

    double getFolderSizeInMB(Long profileId, String folderPath) throws Exception;

    FileContent getFile(Long profileId, String path) throws Exception;

    void shareFile(Long profileId, String path, List<String> emails, String role, String driveFileId) throws Exception;

    void unShareFile(Long profileId, String path, List<String> emails, String driveFileId) throws Exception;

    void unshareRestrictedFiles(UploadFilesRequest request, FileUploadDetails fileUploadDetails, Long profileId);

    record FileContent(
            String fileId,
            String fileName,
            String mimeType,
            Long size,
            String webViewLink,
            String webContentLink,
            String content) {}
}
