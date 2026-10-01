package com.dental_stack.exception.notification;

/** Exception thrown when unsupported notification types are encountered. */
public class UnsupportedNotificationTypeException extends NotificationException {

    private static final String ERROR_CODE = "UNSUPPORTED_NOTIFICATION_TYPE";

    public UnsupportedNotificationTypeException(String messageType) {
        super(ERROR_CODE, String.format("Unsupported notification type: %s", messageType));
    }

    public UnsupportedNotificationTypeException(String messageType, Throwable cause) {
        super(ERROR_CODE, String.format("Unsupported notification type: %s", messageType), cause);
    }
}
