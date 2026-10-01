package com.dentalstack.patient.feature.reminder.exception;

import com.dentalstack.patient.feature.treatment.entity.CustomAlignerReminder;
import com.dentalstack.patient.feature.treatment.entity.DefaultAlignerReminder;
import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class ReminderAlreadyExistsException extends BusinessException {
    public ReminderAlreadyExistsException(CustomAlignerReminder r, Long alignerJourneyId) {
        super(
                BusinessErrorCode.REMINDER_ALREADY_EXISTS,
                String.format(
                        "%s Reminder with name %s on date %s at time %s already exits for aligner journey %d",
                        r.getFrequency(), r.getName(), r.getDate(), r.getTime(), alignerJourneyId));
    }

    public ReminderAlreadyExistsException(DefaultAlignerReminder r, Long alignerJourneyId) {
        super(
                BusinessErrorCode.REMINDER_ALREADY_EXISTS,
                String.format(
                        "Reminder with name %s at time %s already exits for aligner journey %d",
                        r.getName(), r.getTime(), alignerJourneyId));
    }
}
