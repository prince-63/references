package com.dentalstack.auth.exception;

public class ResetPasswordNotAvailableException extends BusinessException {
    public ResetPasswordNotAvailableException(String message) {
        super(BusinessErrorCode.RESET_PASSWORD_NOT_AVAILABLE, message);
    }
}
