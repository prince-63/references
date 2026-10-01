package com.dentalstack.auth.exception.token;

import com.dentalstack.auth.enums.AuthType;
import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.BusinessErrorCode;
import com.dentalstack.auth.exception.BusinessException;

public class InvalidAuthTypeException extends BusinessException {
    public InvalidAuthTypeException(Long userId, UserType userType, AuthType authType) {
        super(
                BusinessErrorCode.INVALID_AUTH_TYPE,
                String.format("Invalid auth type %s for the %s with id %s", authType, userType, userId));
    }
}
