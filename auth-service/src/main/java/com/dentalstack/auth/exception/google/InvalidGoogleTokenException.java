package com.dentalstack.auth.exception.google;

import com.dentalstack.auth.exception.BusinessErrorCode;
import com.dentalstack.auth.exception.BusinessException;

public class InvalidGoogleTokenException extends BusinessException {
    public InvalidGoogleTokenException(String emailId) {
        super(
                BusinessErrorCode.INVALID_GOOGLE_TOKEN,
                String.format("Invalid google token sent for doctor with email %s", emailId));
    }
}
