package com.dental_stack.exception.aws;

import com.dental_stack.exception.BaseException;

/** Base exception for AWS S3-related operations. */
public abstract class AwsOperationException extends BaseException {

    protected AwsOperationException(String errorCode, String message) {
        super(errorCode, message);
    }

    protected AwsOperationException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }

    protected AwsOperationException(String errorCode, String message, Object... args) {
        super(errorCode, message, args);
    }

    protected AwsOperationException(
            String errorCode, String message, Throwable cause, Object... args) {
        super(errorCode, message, cause, args);
    }
}
