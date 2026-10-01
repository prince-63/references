package com.dentalstack.auth.exception;

import com.dentalstack.auth.enums.patient.UserType;

public class AuthResetNotStartedException extends BusinessException {
    public AuthResetNotStartedException(String mobileNo, UserType userType) {
        super(
                BusinessErrorCode.RESET_NOT_STARTED,
                String.format("Auth not being reset of %s with mobile no. `%s`", userType, mobileNo));
    }
}
