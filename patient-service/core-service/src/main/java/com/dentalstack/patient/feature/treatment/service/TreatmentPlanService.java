package com.dentalstack.patient.feature.treatment.service;

import com.dentalstack.patient.feature.treatment.dto.TreatmentPlan;

public interface TreatmentPlanService {
    TreatmentPlan getPlan(Long id, String productType);
}
