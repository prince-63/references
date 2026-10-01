package com.dentalstack.auth.exception.doctor;

import com.dentalstack.auth.entity.Auth;
import com.dentalstack.auth.exception.BusinessErrorCode;
import com.dentalstack.auth.exception.BusinessException;

public class UserAlreadySignedUpException extends BusinessException {
    public UserAlreadySignedUpException(Auth auth) {
        super(
                BusinessErrorCode.USER_ALREADY_SIGNED_UP,
                String.format(
                        "User %s has already signed up with email `%s` and mobile no. `%s`",
                        auth.getUserType(), auth.getEmail(), auth.getMobileNo()));
    }

    public UserAlreadySignedUpException(Auth auth, String message) {
        super(
                BusinessErrorCode.USER_ALREADY_SIGNED_UP,
                String.format(
                        "User %s has already signed up with mobile no. `%s`", auth.getUserType(), auth.getMobileNo()));
    }
}
