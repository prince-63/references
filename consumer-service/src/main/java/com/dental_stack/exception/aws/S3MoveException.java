package com.dental_stack.exception.aws;

/** Exception thrown when AWS S3 file move operations fail. */
public class S3MoveException extends AwsOperationException {

    private static final String ERROR_CODE = "S3_MOVE_ERROR";

    public S3MoveException(String message) {
        super(ERROR_CODE, message);
    }

    public S3MoveException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public S3MoveException(String bucket, String srcKey, String destKey, Throwable cause) {
        super(
                ERROR_CODE,
                String.format(
                        "Failed to move file in S3 | bucket=%s | srcKey=%s | destKey=%s",
                        bucket, srcKey, destKey),
                cause);
    }
}
