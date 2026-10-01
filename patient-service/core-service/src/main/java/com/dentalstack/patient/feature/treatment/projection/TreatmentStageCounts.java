package com.dentalstack.patient.feature.treatment.projection;

public interface TreatmentStageCounts {
    long getTrackingPendingCount();

    long getPlanningCount();

    long getPlanningCount2();

    long getAssessmentCount();
}
