package com.dentalstack.auth.exception;

import static com.dentalstack.auth.exception.BusinessErrorCode.THREE_FAILED_ATTEMPT_EXCEPTION;

import com.dentalstack.auth.entity.Auth;

public class ThreeFailedAttemptException extends BusinessException {
    public ThreeFailedAttemptException(Auth auth) {
        super(
                THREE_FAILED_ATTEMPT_EXCEPTION,
                String.format(
                        "Three consecutive failed attempts for user '%s' with email '%s'",
                        auth.getUserType(), auth.getEmail()));
    }
}
