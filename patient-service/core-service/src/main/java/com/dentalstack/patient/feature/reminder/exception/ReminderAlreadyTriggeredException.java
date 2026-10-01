package com.dentalstack.patient.feature.reminder.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class ReminderAlreadyTriggeredException extends BusinessException {
    public ReminderAlreadyTriggeredException(long reminderId) {
        super(
                BusinessErrorCode.REMINDER_ALREADY_TRIGGERED,
                String.format("Reminder with id %s already triggered", reminderId));
    }
}
