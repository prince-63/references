package com.dentalstack.auth.exception.token;

import com.dentalstack.auth.enums.AuthType;
import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.BusinessErrorCode;
import com.dentalstack.auth.exception.BusinessException;

public class TokenExpiredException extends BusinessException {
    public TokenExpiredException(Long userId, UserType userType, AuthType authType) {
        super(
                BusinessErrorCode.TOKEN_EXPIRED,
                String.format("Token expired of type %s of %s with id %s", authType, userType, userId));
    }
}
