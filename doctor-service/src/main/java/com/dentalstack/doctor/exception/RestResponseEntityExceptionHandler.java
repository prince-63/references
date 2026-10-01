package com.dentalstack.doctor.exception;

import com.dentalstack.doctor.dto.ErrorInfo;
import com.dentalstack.doctor.exception.billing.DoctorBillingAlreadyExistException;
import com.dentalstack.doctor.exception.billing.DoctorBillingNotFoundException;
import com.dentalstack.doctor.exception.billing.FailedToParseCreateBillingException;
import com.dentalstack.doctor.exception.doctor.InvalidRequestException;
import com.dentalstack.doctor.exception.doctor.UserNotFoundException;
import com.dentalstack.doctor.exception.file.FileSizeExceededException;
import com.dentalstack.doctor.exception.invitation.*;
import com.dentalstack.doctor.exception.organization.OrganizationAlreadyPresentException;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Unified exception handler for the entire application.
 * Consolidates GlobalExceptionHandler + RestResponseEntityExceptionHandler.
 */
@ControllerAdvice
@Slf4j
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    // ── Business-rule violations → 400 BAD REQUEST ──

    @ExceptionHandler(
            value = {
                OrganizationAlreadyPresentException.class,
                FailedToParseCreateBillingException.class,
                InvitationException.class,
                DoctorBillingNotFoundException.class,
                DoctorBillingAlreadyExistException.class,
                InvitationExpiredException.class,
                InvitationAlreadyExistsException.class,
                InvitationAlreadyExistsForEmailException.class,
                InvitationAlreadyExistsForMobileException.class,
                UserNotFoundException.class,
                FileSizeExceededException.class,
                GenericException.class,
                InvalidRequestException.class,
                UserWithEmailNotFoundException.class,
                WrongPasswordException.class
            })
    protected ResponseEntity<ErrorInfo> handleBadRequest(RuntimeException e, WebRequest req) {
        BusinessErrorCode errorCode = null;
        if (e instanceof BusinessException be) {
            errorCode = be.getErrorCode();
        }

        return ResponseEntity.badRequest()
                .body(ErrorInfo.builder()
                        .url(((ServletWebRequest) req).getRequest().getRequestURI())
                        .message(e.getLocalizedMessage())
                        .errorCode(errorCode)
                        .build());
    }

    // ── @Valid / @NotNull / @NotBlank validation failures → 400 BAD REQUEST ──

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));

        ErrorInfo errorInfo = ErrorInfo.builder()
                .url(((ServletWebRequest) request).getRequest().getRequestURI())
                .message(message)
                .build();

        return ResponseEntity.badRequest().body(errorInfo);
    }

    // ── Catch-all for unexpected errors → 500 INTERNAL SERVER ERROR ──

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorInfo> handleUnexpectedError(Exception e, WebRequest req) {
        log.error("Unhandled exception", e);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorInfo.builder()
                        .url(((ServletWebRequest) req).getRequest().getRequestURI())
                        .message("An unexpected error occurred")
                        .build());
    }
}
