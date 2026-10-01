package com.dental_stack.files.common.services;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.dental_stack.application.DatabaseContextHolder;
import com.dental_stack.application.DatabaseType;
import com.dental_stack.exception.aws.S3DeleteException;
import com.dental_stack.exception.aws.S3DownloadException;
import com.dental_stack.exception.aws.S3MoveException;
import com.dental_stack.exception.database.DatabaseContextException;
import com.dental_stack.files.common.config.S3BucketConfig;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AwsService {

    private final AmazonS3 amazonS3;
    private final S3BucketConfig bucketConfig;

    private String resolveBucket() {
        DatabaseType type = DatabaseContextHolder.get();
        if (type == null) {
            throw DatabaseContextException.tenantNotSet();
        }
        return bucketConfig.resolve(type);
    }

    public byte[] downloadFile(String key) {
        String bucket = resolveBucket();

        try (var s3Object = amazonS3.getObject(bucket, key);
                var contentStream = s3Object.getObjectContent()) {

            return contentStream.readAllBytes();

        } catch (AmazonServiceException | IOException e) {
            log.error("Failed to download file from {} with key {}", bucket, key, e);
            throw new S3DownloadException(bucket, key, e);
        }
    }

    public void deleteFile(String key) {
        String bucket = resolveBucket();

        try {
            amazonS3.deleteObject(bucket, key);
        } catch (SdkClientException e) {
            log.error("Failed to delete file {} from bucket {}", key, bucket, e);
            throw new S3DeleteException(bucket, key, e);
        }
    }

    private void zip(Path downloadedDir, OutputStream out, String dirName) throws IOException {
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

    public void moveFolderPrefix(String srcPrefix, String destPrefix) {
        String bucket = resolveBucket();
        srcPrefix = normalizePrefix(srcPrefix);
        destPrefix = normalizePrefix(destPrefix);
        ListObjectsV2Request request =
                new ListObjectsV2Request().withBucketName(bucket).withPrefix(srcPrefix);

        ListObjectsV2Result result;
        do {
            result = amazonS3.listObjectsV2(request);
            for (S3ObjectSummary obj : result.getObjectSummaries()) {
                String srcKey = obj.getKey();
                if (srcKey.endsWith("/")) {
                    continue;
                }
                String destKey = destPrefix + srcKey.substring(srcPrefix.length());
                if (!amazonS3.doesObjectExist(bucket, destKey)) {
                    amazonS3.copyObject(bucket, srcKey, bucket, destKey);
                }
                amazonS3.deleteObject(bucket, srcKey);
                log.info("Moved S3 object {} → {}", srcKey, destKey);
            }
            request.setContinuationToken(result.getNextContinuationToken());
        } while (result.isTruncated());
    }

    public String copyFile(String srcKey, String destKey) {
        String bucket = resolveBucket();
        try {
            amazonS3.copyObject(bucket, srcKey, bucket, destKey);
            return amazonS3.getUrl(bucket, destKey).toString();
        } catch (AmazonServiceException e) {
            log.error(
                    "Failed to copy object from {} to {} in bucket {}", srcKey, destKey, bucket, e);
            throw new S3MoveException(bucket, srcKey, destKey, e);
        }
    }

    public String moveFile(String srcKey, String destKey) {
        String bucket = resolveBucket();

        String newUrl;
        try {
            newUrl = copyFile(srcKey, destKey);
        } catch (Exception e) {
            log.error("Failed to copy object from {} to {} during move", srcKey, destKey, e);
            throw new S3MoveException(bucket, srcKey, destKey, e);
        }
        try {
            amazonS3.deleteObject(bucket, srcKey);
        } catch (AmazonServiceException e) {
            log.error("Failed to delete source object {} during move", srcKey, e);

            // rollback copy
            amazonS3.deleteObject(bucket, destKey);

            throw new S3MoveException(bucket, srcKey, destKey, e);
        }
        return newUrl;
    }

    private String normalizePrefix(String key) {
        return key.endsWith("/") ? key : key + "/";
    }
}
