package com.dentalstack.patient.feature.reminder.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public interface DefaultAlignerReminderSummary {
    Long getId();

    Long getAlignerJourneyId();

    LocalTime getTime();

    String getType();

    String getEmail();

    default Integer getCurrentAlignerSrNo() {
        return null;
    }

    default LocalDate getNextAlignerChangeDate() {
        return null;
    }
}
