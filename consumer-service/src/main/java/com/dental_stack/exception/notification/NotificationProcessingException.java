package com.dental_stack.exception.notification;

/** Exception thrown when notification processing fails. */
public class NotificationProcessingException extends NotificationException {

    private static final String ERROR_CODE = "NOTIFICATION_PROCESSING_ERROR";

    public NotificationProcessingException(String message) {
        super(ERROR_CODE, message);
    }

    public NotificationProcessingException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public static NotificationProcessingException forType(String messageType, Throwable cause) {
        return new NotificationProcessingException(
                String.format("Failed to process notification of type: %s", messageType), cause);
    }
}
