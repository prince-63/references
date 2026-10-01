package com.dentalstack.patient.feature.storage.s3;

import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@Profile("local")
public class MockAmazonS3ServiceImpl implements AmazonS3Service {

    private static final Map<String, MultipartFile> store = new HashMap<>();

    @Override
    public String storeFile(String bucket, String key, MultipartFile file) {
        var storeKey = bucket + ":" + key;
        if (store.containsKey(storeKey)) {
            return store.get(storeKey).getName();
        }

        store.put(storeKey, file);
        return file.getName();
    }

    @Override
    public void deleteFile(String bucket, String key) {
        var storeKey = bucket + ":" + key;
        store.remove(storeKey);
    }

    @Override
    public void createFolder(String bucket, String folderName) {}

    @Override
    public String copyFile(String bucket, String srcKey, String destKey) {
        return null;
    }

    @Override
    public String moveFile(String bucket, String srcKey, String destKey) {
        return null;
    }

    @Override
    public Map<String, AmazonS3ServiceImpl.RenamedFileDetails> renameFolder(
            String bucket, String srcKey, String newName) {
        return null;
    }

    @Override
    public byte[] downloadFile(String bucket, String key) {
        return null;
    }

    @Override
    public byte[] downloadFolder(String bucket, String key, @NotNull String dirName)
            throws IOException, InterruptedException {
        return new byte[0];
    }

    @Override
    public double getFolderSizeInMB(String bucket, String folderPath) {
        return 0.0;
    }
}
