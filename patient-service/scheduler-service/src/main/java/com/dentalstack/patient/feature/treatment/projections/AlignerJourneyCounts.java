package com.dentalstack.patient.feature.treatment.projections;

public interface AlignerJourneyCounts {
    Integer getMissedAlignerChanges();

    Integer getTreatmentStartingToday();

    Integer getTreatmentStartingTomorrow();
}
