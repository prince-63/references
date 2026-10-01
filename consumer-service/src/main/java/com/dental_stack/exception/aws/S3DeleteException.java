package com.dental_stack.exception.aws;

/** Exception thrown when AWS S3 file deletion operations fail. */
public class S3DeleteException extends AwsOperationException {

    private static final String ERROR_CODE = "S3_DELETE_ERROR";

    public S3DeleteException(String message) {
        super(ERROR_CODE, message);
    }

    public S3DeleteException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public S3DeleteException(String bucket, String key, Throwable cause) {
        super(
                ERROR_CODE,
                String.format("Failed to delete file from S3 | bucket=%s | key=%s", bucket, key),
                cause);
    }
}
