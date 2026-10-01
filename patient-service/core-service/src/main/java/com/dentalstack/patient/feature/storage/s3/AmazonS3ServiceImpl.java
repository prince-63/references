package com.dentalstack.patient.feature.storage.s3;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.services.s3.transfer.TransferManagerBuilder;
import jakarta.validation.constraints.NotNull;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@Primary
@RequiredArgsConstructor
public class AmazonS3ServiceImpl implements AmazonS3Service {

    @Autowired
    private AwsCredentialManager awsCredentialManager;

    @Override
    public String storeFile(String bucket, String key, MultipartFile file) throws IOException {
        AmazonS3 s3 = awsCredentialManager.getAmazonS3Client();

        final long partSize = 50 * 1024 * 1024;
        List<PartETag> partETags = new ArrayList<>();
        InitiateMultipartUploadRequest initRequest =
                new InitiateMultipartUploadRequest(bucket, key).withObjectMetadata(buildMetadata(file));

        InitiateMultipartUploadResult initResponse = s3.initiateMultipartUpload(initRequest);

        String uploadId = initResponse.getUploadId();
        try (InputStream inputStream = file.getInputStream()) {
            byte[] buffer = new byte[(int) partSize];
            int bytesRead;
            int partNumber = 1;

            while ((bytesRead = inputStream.read(buffer)) != -1) {
                UploadPartRequest uploadRequest = new UploadPartRequest()
                        .withBucketName(bucket)
                        .withKey(key)
                        .withUploadId(uploadId)
                        .withPartNumber(partNumber)
                        .withInputStream(new ByteArrayInputStream(
                                bytesRead == partSize ? buffer : Arrays.copyOf(buffer, bytesRead)))
                        .withPartSize(bytesRead);

                UploadPartResult uploadResult = s3.uploadPart(uploadRequest);
                partETags.add(uploadResult.getPartETag());
                partNumber++;
            }

            CompleteMultipartUploadRequest completeRequest =
                    new CompleteMultipartUploadRequest(bucket, key, uploadId, partETags);

            s3.completeMultipartUpload(completeRequest);
        } catch (Exception e) {
            log.error("Multipart upload failed for key {}, aborting upload", key, e);
            s3.abortMultipartUpload(new AbortMultipartUploadRequest(bucket, key, uploadId));
            throw e;
        }

        return s3.getUrl(bucket, key).toString();
    }

    private ObjectMetadata buildMetadata(MultipartFile file) {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());
        metadata.setSSEAlgorithm(ObjectMetadata.AES_256_SERVER_SIDE_ENCRYPTION);
        return metadata;
    }

    @Override
    public void deleteFile(String bucket, String key) {
        var s3 = awsCredentialManager.getAmazonS3Client();
        try {
            s3.deleteObject(bucket, key);
        } catch (AmazonServiceException e) {
            log.error("Failed to delete file to amazon s3 with error {}", e.getLocalizedMessage());
            throw e;
        } catch (SdkClientException e) {
            log.error("Failed to delete file to amazon s3 on the client side with error {}", e.getLocalizedMessage());
            throw e;
        }
    }

    @Override
    public void createFolder(String bucketName, String folderName) {
        var s3 = awsCredentialManager.getAmazonS3Client();

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(0);

        InputStream emptyContent = new ByteArrayInputStream(new byte[0]);

        PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, folderName, emptyContent, metadata);

        s3.putObject(putObjectRequest);
    }

    @Override
    public String copyFile(String bucket, String srcKey, String destKey) {
        var s3 = awsCredentialManager.getAmazonS3Client();
        try {
            s3.copyObject(bucket, srcKey, bucket, destKey);
            return s3.getUrl(bucket, destKey).toString();
        } catch (AmazonServiceException e) {
            log.error("Failed to copy the object from {} to {}", srcKey, destKey);
            throw e;
        }
    }

    @Override
    public String moveFile(String bucket, String srcKey, String destKey) {
        var newUrl = "";
        try {
            newUrl = copyFile(bucket, srcKey, destKey);
        } catch (AmazonServiceException e) {
            log.error("Failed to copy object from {} to {} in moving operation", srcKey, destKey, e);
            throw e;
        }

        try {
            deleteFile(bucket, srcKey);
        } catch (AmazonServiceException e) {
            log.error("Failed to delete the object from source location {} in moving operation", srcKey);
            deleteFile(bucket, destKey);
            throw e;
        }

        return newUrl;
    }

    @Override
    public Map<String, RenamedFileDetails> renameFolder(String bucket, String srcKey, String newName) {
        var destKey = Paths.get(srcKey).getParent().resolve(newName).toString();
        var oldToNewKeys = new HashMap<String, RenamedFileDetails>();

        var s3 = awsCredentialManager.getAmazonS3Client();
        var listReq = new ListObjectsV2Request().withBucketName(bucket).withPrefix(srcKey);
        var listResp = s3.listObjectsV2(listReq);
        for (var obj : listResp.getObjectSummaries()) {
            var currentObjKey = obj.getKey();
            var objDestKey = destKey + currentObjKey.substring(srcKey.length());

            var newUrl = moveFile(bucket, obj.getKey(), objDestKey);
            oldToNewKeys.put(currentObjKey, new RenamedFileDetails(currentObjKey, objDestKey, newUrl));
        }

        return oldToNewKeys;
    }

    public record RenamedFileDetails(String oldKey, String newKey, String newUrl) {}

    @Override
    public byte[] downloadFile(String bucket, String key) throws IOException {
        try {
            var s3 = awsCredentialManager.getAmazonS3Client();
            try (var s3Object = s3.getObject(bucket, key)) {
                try (var contentStream = s3Object.getObjectContent()) {
                    return contentStream.readAllBytes();
                }
            }
        } catch (AmazonServiceException | IOException e) {
            log.error("Failed to download file from {} with key {}", bucket, key);
            throw e;
        }
    }

    @Override
    public byte[] downloadFolder(String bucket, String key, @NotNull String dirName)
            throws IOException, InterruptedException {
        File downloadedDir = null;
        try {
            downloadedDir = Files.createTempDirectory(bucket + "_" + key.replace('/', '_'))
                    .toFile();
        } catch (IOException e) {
            log.error("Failed to create a temporary directory", e);
            throw e;
        }

        var transferManager = TransferManagerBuilder.standard()
                .withS3Client(awsCredentialManager.getAmazonS3Client())
                .build();
        var downloads = transferManager.downloadDirectory(bucket, key, downloadedDir);
        try {
            downloads.waitForCompletion();
        } catch (InterruptedException e) {
            throw e;
        }

        try (var out = new ByteArrayOutputStream()) {
            zip(downloadedDir.toPath(), out, dirName);
            boolean deleted = downloadedDir.delete();
            if (!deleted) {
                log.warn("Failed to delete the temp directory used to download files.");
            }

            return out.toByteArray();
        }
    }

    public void zip(Path downloadedDir, OutputStream out, String dirName) throws IOException {
        try (ZipOutputStream zs = new ZipOutputStream(out)) {
            try (var paths = Files.walk(downloadedDir).filter(path -> !Files.isDirectory(path))) {
                for (var path : paths.toList()) {
                    var relativePath = downloadedDir.relativize(path).toString();
                    var idx = relativePath.indexOf(dirName + "/");
                    if (idx == -1) {
                        return;
                    }
                    ZipEntry zipEntry = new ZipEntry(relativePath.substring(idx));
                    zs.putNextEntry(zipEntry);
                    Files.copy(path, zs);
                    zs.closeEntry();
                }
            }
        }
    }

    @Override
    public double getFolderSizeInMB(String bucket, String folderPath) {
        var s3 = awsCredentialManager.getAmazonS3Client();
        long totalSizeInBytes = 0;
        String prefix = folderPath;
        if (!prefix.endsWith("/")) {
            prefix += "/";
        }

        ListObjectsV2Request request =
                new ListObjectsV2Request().withBucketName(bucket).withPrefix(prefix);

        ListObjectsV2Result result;
        do {
            result = s3.listObjectsV2(request);
            for (S3ObjectSummary objectSummary : result.getObjectSummaries()) {
                totalSizeInBytes += objectSummary.getSize();
            }
            request.setContinuationToken(result.getNextContinuationToken());
        } while (result.isTruncated());

        return totalSizeInBytes / (1024.0 * 1024.0);
    }
}
