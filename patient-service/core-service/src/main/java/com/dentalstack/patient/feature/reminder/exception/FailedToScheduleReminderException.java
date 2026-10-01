package com.dentalstack.patient.feature.reminder.exception;

import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class FailedToScheduleReminderException extends BusinessException {
    public FailedToScheduleReminderException(Reminder reminder) {
        super(
                BusinessErrorCode.FAILED_SCHEDULE_REMINDER,
                String.format("Failed to schedule reminder for %s", reminder.getPurpose()));
    }

    public FailedToScheduleReminderException() {
        super(BusinessErrorCode.FAILED_SCHEDULE_REMINDER, "Failed to schedule reminder");
    }
}
