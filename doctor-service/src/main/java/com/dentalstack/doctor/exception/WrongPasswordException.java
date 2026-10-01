package com.dentalstack.doctor.exception;

public class WrongPasswordException extends BusinessException {
    public WrongPasswordException(String message) {
        super(BusinessErrorCode.PASSWORD_IS_WRONG, message);
    }
}
