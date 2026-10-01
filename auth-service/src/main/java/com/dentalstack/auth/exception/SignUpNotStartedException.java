package com.dentalstack.auth.exception;

import com.dentalstack.auth.enums.patient.UserType;

public class SignUpNotStartedException extends BusinessException {
    public SignUpNotStartedException(String email, String mobileNo, UserType userType) {
        super(
                BusinessErrorCode.SIGN_UP_NOT_STARTED,
                String.format(
                        "Sign up not started of %s with email `%s` and mobile no. `%s`", userType, email, mobileNo));
    }
}
