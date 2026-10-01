package com.dentalstack.patient.feature.reminder.exception;

public class DefaultReminderNotFoundException extends RuntimeException {
    public DefaultReminderNotFoundException(Long defaultReminderId) {
        super(String.format("Default reminder not found with id %d", defaultReminderId));
    }
}
