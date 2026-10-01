package com.dentalstack.auth.exception;

import com.dentalstack.auth.enums.patient.UserType;

public class AuthResetStagesIncompleteException extends BusinessException {
    public AuthResetStagesIncompleteException(String mobileNo, UserType userType) {
        super(
                BusinessErrorCode.RESET_STAGES_INCOMPLETE,
                String.format("Reset stages are not complete for %s with mobile no. %s", userType, mobileNo));
    }
}
