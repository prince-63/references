package com.dentalstack.auth.exception.apple;

import com.dentalstack.auth.exception.BusinessErrorCode;
import com.dentalstack.auth.exception.BusinessException;

public class InvalidAppleTokenException extends BusinessException {
    public InvalidAppleTokenException(String emailId) {
        super(
                BusinessErrorCode.INVALID_APPLE_TOKEN,
                String.format("Invalid apple token sent by user with email %s", emailId));
    }
}
