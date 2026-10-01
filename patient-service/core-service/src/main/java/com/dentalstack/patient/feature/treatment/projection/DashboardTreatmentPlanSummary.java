package com.dentalstack.patient.feature.treatment.projection;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;

public interface DashboardTreatmentPlanSummary {
    Long getId();

    Long getPatientId();

    AlignerTreatmentStatus getStatus();
}
