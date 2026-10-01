package com.dentalstack.patient.feature.patient_onboarding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientOnboardingStepRequest {
    private Long patientId;
    private String nextStep;
    private Boolean forceMoveComplete = false;
}
