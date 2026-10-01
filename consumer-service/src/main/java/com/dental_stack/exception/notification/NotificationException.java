package com.dental_stack.exception.notification;

import com.dental_stack.exception.BaseException;

/** Base exception for notification-related operations. */
public abstract class NotificationException extends BaseException {

    protected NotificationException(String errorCode, String message) {
        super(errorCode, message);
    }

    protected NotificationException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }

    protected NotificationException(String errorCode, String message, Object... args) {
        super(errorCode, message, args);
    }

    protected NotificationException(
            String errorCode, String message, Throwable cause, Object... args) {
        super(errorCode, message, cause, args);
    }
}
