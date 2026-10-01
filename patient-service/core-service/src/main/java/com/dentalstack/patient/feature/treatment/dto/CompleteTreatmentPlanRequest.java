package com.dentalstack.patient.feature.treatment.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompleteTreatmentPlanRequest {
    @NotNull(message = "Treatment plan id cannot be null.")
    private Long treatmentPlanId;

    @NotEmpty(message = "Treatment completed remark cannot be empty.")
    private String treatmentCompletedRemarks;
}
