package com.dental_stack.exception;

import lombok.Getter;

/**
 * Base exception class for all custom exceptions in the application. Provides common functionality
 * for all custom exceptions.
 */
@Getter
public abstract class BaseException extends RuntimeException {
    private final String errorCode;
    private final Object[] args;

    protected BaseException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.args = null;
    }

    protected BaseException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.args = null;
    }

    protected BaseException(String errorCode, String message, Object... args) {
        super(message);
        this.errorCode = errorCode;
        this.args = args;
    }

    protected BaseException(String errorCode, String message, Throwable cause, Object... args) {
        super(message, cause);
        this.errorCode = errorCode;
        this.args = args;
    }
}
