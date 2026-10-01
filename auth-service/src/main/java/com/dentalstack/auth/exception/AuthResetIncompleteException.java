package com.dentalstack.auth.exception;

import com.dentalstack.auth.entity.Auth;

public class AuthResetIncompleteException extends BusinessException {
    public AuthResetIncompleteException(Auth auth) {
        super(
                BusinessErrorCode.RESET_INCOMPLETE,
                String.format(
                        "Auth reset incomplete of %s with email `%s` and mobile no. `%s`",
                        auth.getUserType(), auth.getEmail(), auth.getMobileNo()));
    }
}
