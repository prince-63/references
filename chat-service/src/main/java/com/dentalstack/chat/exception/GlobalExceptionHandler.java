package com.dentalstack.chat.exception;

import com.dentalstack.chat.dto.responsebuilder.ResponseBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<?> handleInvalidRequestException(InvalidRequestException ex) {
        // Create and return a ResponseEntity with the error message and HTTP status
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResponseBuilder.builder()
                        .status(StatusEnum.FAILURE.getValue(), ex.getErrorCode().getCode(), ex.getDescription())
                        .build());
    }
}
