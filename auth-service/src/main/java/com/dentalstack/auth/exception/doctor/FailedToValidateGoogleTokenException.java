package com.dentalstack.auth.exception.doctor;

import static com.dentalstack.auth.exception.BusinessErrorCode.GOOGLE_TOKEN_VALIDATION_FAILED;

import com.dentalstack.auth.exception.BusinessException;

public class FailedToValidateGoogleTokenException extends BusinessException {
    public FailedToValidateGoogleTokenException(String emailId) {
        super(
                GOOGLE_TOKEN_VALIDATION_FAILED,
                String.format("Failed to validate google token for doctor with email %s", emailId));
    }
}
