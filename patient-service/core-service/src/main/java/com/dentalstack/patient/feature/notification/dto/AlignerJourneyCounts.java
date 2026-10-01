package com.dentalstack.patient.feature.notification.dto;

public interface AlignerJourneyCounts {
    Integer getMissedAlignerChanges();

    Integer getTreatmentStartingToday();

    Integer getTreatmentStartingTomorrow();
}
