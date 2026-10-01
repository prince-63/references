package com.dentalstack.patient.feature.treatmenttracking.dto;

import com.dentalstack.patient.feature.treatmenttracking.enums.TreatmentPlanStatus;
import lombok.Data;

@Data
public class UpdateTreatmentPlanStatusRequest {
    private TreatmentPlanStatus status;
}
