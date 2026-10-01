package com.dentalstack.patient.feature.patient_onboarding.dto;

import com.dentalstack.patient.feature.patient_onboarding.entity.PatientOnboarding;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientOnboardingResponse {
    private Long patientId;
    private String prevStep;
    private String currentStep;
    private String nextStep;
    private Boolean locked = false;

    public static PatientOnboardingResponse from(PatientOnboarding patientOnboarding) {
        return PatientOnboardingResponse.builder()
                .patientId(patientOnboarding.getPatient().getId())
                .prevStep(
                        patientOnboarding.getPrevStep() != null
                                ? patientOnboarding.getPrevStep().name()
                                : null)
                .currentStep(patientOnboarding.getCurrentStep().name())
                .nextStep(
                        patientOnboarding.getNextStep() != null
                                ? patientOnboarding.getNextStep().name()
                                : null)
                .locked(patientOnboarding.getLocked())
                .build();
    }
}
