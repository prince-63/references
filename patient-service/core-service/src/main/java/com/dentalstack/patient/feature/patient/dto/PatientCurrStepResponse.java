package com.dentalstack.patient.feature.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PatientCurrStepResponse {
    private Long patientId;
    private Long currentStep;
}
