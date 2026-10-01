package com.dental_stack.exception.aws;

/** Exception thrown when AWS S3 file download operations fail. */
public class S3DownloadException extends AwsOperationException {

    private static final String ERROR_CODE = "S3_DOWNLOAD_ERROR";

    public S3DownloadException(String message) {
        super(ERROR_CODE, message);
    }

    public S3DownloadException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public S3DownloadException(String bucket, String key, Throwable cause) {
        super(
                ERROR_CODE,
                String.format("Failed to download file from S3 | bucket=%s | key=%s", bucket, key),
                cause);
    }
}
