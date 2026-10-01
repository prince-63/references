package com.dental_stack.exception.handler;

import com.dental_stack.exception.BaseException;
import com.dental_stack.exception.aws.AwsOperationException;
import com.dental_stack.exception.database.DatabaseContextException;
import com.dental_stack.exception.drive.DriveOperationException;
import com.dental_stack.exception.file.FileOperationException;
import com.dental_stack.exception.notification.NotificationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler for all custom exceptions in the application. Provides centralized
 * exception handling and logging.
 *
 * <p>NOTE: This is a CONSUMER SERVICE (RabbitMQ), not a REST API. Exceptions are re-thrown by
 * consumer beans for RabbitMQ retry handling. This handler primarily provides centralized logging
 * and may be used by Spring Cloud Stream framework internals.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(FileOperationException.class)
    public ResponseEntity<ErrorResponse> handleFileOperationException(FileOperationException ex) {
        log.error("File operation error: {} - {}", ex.getErrorCode(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(DriveOperationException.class)
    public ResponseEntity<ErrorResponse> handleDriveOperationException(DriveOperationException ex) {
        log.error("Drive operation error: {} - {}", ex.getErrorCode(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(AwsOperationException.class)
    public ResponseEntity<ErrorResponse> handleAwsOperationException(AwsOperationException ex) {
        log.error("AWS operation error: {} - {}", ex.getErrorCode(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(NotificationException.class)
    public ResponseEntity<ErrorResponse> handleNotificationException(NotificationException ex) {
        log.error("Notification error: {} - {}", ex.getErrorCode(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(DatabaseContextException.class)
    public ResponseEntity<ErrorResponse> handleDatabaseContextException(
            DatabaseContextException ex) {
        log.error("Database context error: {} - {}", ex.getErrorCode(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex) {
        log.error("Application error: {} - {}", ex.getErrorCode(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred"));
    }

    /** Error response DTO for consistent error messages */
    public record ErrorResponse(String errorCode, String message) {}
}
