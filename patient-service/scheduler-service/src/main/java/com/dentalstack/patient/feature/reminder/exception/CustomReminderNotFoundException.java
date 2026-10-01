package com.dentalstack.patient.feature.reminder.exception;

public class CustomReminderNotFoundException extends RuntimeException {
    public CustomReminderNotFoundException(Long customReminderId) {
        super(String.format("Custom reminder not found with id %d", customReminderId));
    }
}
