package com.dentalstack.patient.feature.reminder.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public interface CustomAlignerReminderSummary {
    Long getId();

    Long getAlignerJourneyId();

    LocalDate getDate();

    LocalTime getTime();

    String getFrequency();

    String getEmail();

    default String getMobileNo() {
        return null;
    }
}
