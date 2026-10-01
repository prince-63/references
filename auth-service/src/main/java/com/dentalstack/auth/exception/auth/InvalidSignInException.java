package com.dentalstack.auth.exception.auth;

import static com.dentalstack.auth.exception.BusinessErrorCode.INVALID_ORG_NAME;

import com.dentalstack.auth.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
public class InvalidSignInException extends BusinessException {
    public InvalidSignInException(String orgName) {
        super(INVALID_ORG_NAME, String.format("Invalid organization name `%s`", orgName));
    }
}
