package com.dentalstack.auth.exception.doctor;

import static com.dentalstack.auth.exception.BusinessErrorCode.*;

import com.dentalstack.auth.entity.Auth;
import com.dentalstack.auth.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
public class LoginAttemptExceededException extends BusinessException {

    public LoginAttemptExceededException(Auth auth, long failedAttemptsCount, long failedLoginAttemptWindow) {
        super(
                LOGIN_ATTEMPTS_EXCEEDED,
                String.format(
                        "Login attempt of %s with email %s and mobile no %s exceeded. User has done %s failed login attempts in last %s minutes.",
                        auth.getUserType(),
                        auth.getEmail(),
                        auth.getMobileNo(),
                        failedAttemptsCount + 1,
                        failedLoginAttemptWindow));
    }
}
