package com.dentalstack.patient.feature.treatment.projection;

import com.dentalstack.patient.feature.treatment.enums.AlignerTreatmentStatus;

public interface DashboardTreatmentPlanSummary {
    Long getId();

    Long getPatientId();

    AlignerTreatmentStatus getStatus();
}
