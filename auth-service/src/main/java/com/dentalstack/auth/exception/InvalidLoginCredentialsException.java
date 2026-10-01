package com.dentalstack.auth.exception;

import com.dentalstack.auth.entity.Auth;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
public class InvalidLoginCredentialsException extends BusinessException {

    public InvalidLoginCredentialsException(Auth auth) {
        super(
                BusinessErrorCode.INVALID_LOGIN_CREDENTIALS,
                String.format(
                        "Invalid login credentials for %s with email `%s` and mobile no `%s`.",
                        auth.getUserType(), auth.getEmail(), auth.getMobileNo()));
    }

    public InvalidLoginCredentialsException(String message) {
        super(BusinessErrorCode.INVALID_LOGIN_CREDENTIALS, String.format(message));
    }
}
