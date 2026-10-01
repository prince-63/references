package com.dentalstack.patient.feature.storage.s3;

import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface AmazonS3Service {
    String storeFile(String bucket, String key, MultipartFile file) throws IOException;

    void deleteFile(String bucket, String key);

    void createFolder(String bucket, String folderName);

    String copyFile(String bucket, String srcKey, String destKey);

    String moveFile(String bucket, String srcKey, String destKey);

    Map<String, AmazonS3ServiceImpl.RenamedFileDetails> renameFolder(String bucket, String srcKey, String newName);

    byte[] downloadFile(String bucket, String key) throws IOException;

    byte[] downloadFolder(String bucket, String key, @NotNull String dirName) throws IOException, InterruptedException;

    double getFolderSizeInMB(String bucket, String folderPath);
}
