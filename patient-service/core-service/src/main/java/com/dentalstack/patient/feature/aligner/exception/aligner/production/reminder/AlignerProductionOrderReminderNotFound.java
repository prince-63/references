package com.dentalstack.patient.feature.aligner.exception.aligner.production.reminder;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AlignerProductionOrderReminderNotFound extends BusinessException {
    public AlignerProductionOrderReminderNotFound(long reminderId, long alignerJourneyId) {
        super(
                BusinessErrorCode.ALIGNER_PRODUCTION_REMINDER_NOT_FOUND,
                String.format(
                        "Reminder with id %s not found in aligner journey with id %s", reminderId, alignerJourneyId));
    }
}
