package com.dentalstack.doctor.exception;

public class UserWithEmailNotFoundException extends BusinessException {
    public UserWithEmailNotFoundException(String message) {
        super(BusinessErrorCode.USER_NOT_FOUND_WITH_EMAIL, message);
    }
}
