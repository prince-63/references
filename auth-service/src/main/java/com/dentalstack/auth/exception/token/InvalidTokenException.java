package com.dentalstack.auth.exception.token;

import com.dentalstack.auth.enums.AuthType;
import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.BusinessErrorCode;
import com.dentalstack.auth.exception.BusinessException;

public class InvalidTokenException extends BusinessException {
    public InvalidTokenException(Long userId, UserType userType, AuthType authType) {
        super(
                BusinessErrorCode.INVALID_TOKEN,
                String.format("Token is invalid of type %s of %s with id %s", authType, userType, userId));
    }

    public InvalidTokenException(String message) {
        super(BusinessErrorCode.INVALID_TOKEN, message);
    }
}
