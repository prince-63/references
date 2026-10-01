package com.dentalstack.patient.feature.reminder.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class ReminderNotFoundException extends BusinessException {
    public ReminderNotFoundException(long reminderId) {
        super(BusinessErrorCode.REMINDER_NOT_FOUND, String.format("Reminder not found with id %s", reminderId));
    }
}
