package com.dentalstack.auth.exception.token;

import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.BusinessErrorCode;
import com.dentalstack.auth.exception.BusinessException;

public class UserNotFoundException extends BusinessException {
    public UserNotFoundException(Long userId, UserType userType) {
        super(
                BusinessErrorCode.USER_NOT_FOUND,
                String.format("User not found with id %s and type %s", userId, userType));
    }

    public UserNotFoundException(String email) {
        super(BusinessErrorCode.USER_NOT_FOUND, String.format("User not found with email %s", email));
    }
}
