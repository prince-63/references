package com.dentalstack.auth.exception;

import static com.dentalstack.auth.exception.BusinessErrorCode.LOGIN_BLOCKED;

import com.dentalstack.auth.entity.Auth;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
public class LoginBlockedException extends BusinessException {
    public LoginBlockedException(Auth auth) {
        super(
                LOGIN_BLOCKED,
                String.format(
                        "Login blocked of %s with email `%s` and mobile no. `%s`",
                        auth.getUserType(), auth.getEmail(), auth.getMobileNo()));
    }

    public LoginBlockedException(Auth auth, Long blockedLoginWindowMinutes) {
        super(
                LOGIN_BLOCKED,
                String.format(
                        "Login blocked of %s with email `%s` and mobile no. `%s` for %s minutes",
                        auth.getUserType(), auth.getEmail(), auth.getMobileNo(), blockedLoginWindowMinutes));
    }
}
