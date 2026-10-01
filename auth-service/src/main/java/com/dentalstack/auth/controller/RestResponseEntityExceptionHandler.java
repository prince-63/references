package com.dentalstack.auth.controller;

import com.dentalstack.auth.dto.ErrorInfo;
import com.dentalstack.auth.exception.*;
import com.dentalstack.auth.exception.apple.AppleTokenExpiredException;
import com.dentalstack.auth.exception.auth.InvalidSignInException;
import com.dentalstack.auth.exception.doctor.*;
import com.dentalstack.auth.exception.google.GoogleTokenExpiredException;
import com.dentalstack.auth.exception.google.GoogleTokenVerificationFailedException;
import com.dentalstack.auth.exception.google.InvalidGoogleTokenException;
import com.dentalstack.auth.exception.patient.*;
import com.dentalstack.auth.exception.token.InvalidAuthTypeException;
import com.dentalstack.auth.exception.token.InvalidTokenException;
import com.dentalstack.auth.exception.token.TokenExpiredException;
import com.dentalstack.auth.exception.token.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(value = {FailedToSendOTPException.class})
    protected ResponseEntity<ErrorInfo> handleInternalServerError(BusinessException e, WebRequest req) {
        return ResponseEntity.internalServerError()
                .body(ErrorInfo.builder()
                        .message(e.getLocalizedMessage())
                        .errorCode(e.getErrorCode())
                        .build());
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(
            value = {
                // Sign up related
                UserAlreadySignedUpException.class,
                UserSignedWithDifferentCredentials.class,

                // Reset password related
                ResetPasswordNotAvailableException.class
            })
    protected ResponseEntity<ErrorInfo> handleBadRequest(BusinessException e, WebRequest req) {
        return ResponseEntity.badRequest()
                .body(ErrorInfo.builder()
                        .message(e.getLocalizedMessage())
                        .errorCode(e.getErrorCode())
                        .build());
    }

    @ExceptionHandler(
            value = {
                InvalidLoginCredentialsException.class,
                LoginBlockedException.class,
                LoginAttemptExceededException.class,
                // OTP related
                OTPExpiredException.class,
                OTPValidationFailedException.class,
                OTPNotFoundException.class,
                OTPValidationNotStartedException.class,
                LoginAttemptExceededException.class,
                InvalidGoogleTokenException.class,
                FailedToValidateGoogleTokenException.class,
                UserNotSignedUpException.class,
                InvalidSignInException.class,
                UserLoggedInAnotherDeviceException.class,
                InvalidLoginMethodException.class,

                // Login related
                ThreeFailedAttemptException.class,

                // Sign-up related
                SignUpNotStartedException.class,
                AuthStageNotCompleteException.class,
                CredentialsNotSetException.class,

                // Reset related
                AuthResetIncompleteException.class,
                AuthResetNotStartedException.class,
                DeviceNotFoundException.class,
                UserNotFoundException.class,
                AuthResetStagesIncompleteException.class
            })
    public ResponseEntity<ErrorInfo> passwordFailed(BusinessException e, WebRequest req) {
        return ResponseEntity.badRequest()
                .body(ErrorInfo.builder()
                        .message(e.getLocalizedMessage())
                        .errorCode(e.getErrorCode())
                        .build());
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(
            value = {

                // Token related
                InvalidAuthTypeException.class,
                InvalidTokenException.class,
                TokenExpiredException.class,
                GoogleTokenVerificationFailedException.class,
                GoogleTokenExpiredException.class,
                AppleTokenExpiredException.class,
            })
    protected ResponseEntity<ErrorInfo> handleUnForbiddenRequest(BusinessException e, WebRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorInfo.builder()
                        .message(e.getLocalizedMessage())
                        .errorCode(e.getErrorCode())
                        .build());
    }
}
