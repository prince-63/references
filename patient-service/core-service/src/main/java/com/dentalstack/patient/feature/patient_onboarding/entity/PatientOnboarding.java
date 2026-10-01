package com.dentalstack.patient.feature.patient_onboarding.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient_onboarding.enums.OnboardingStep;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "patient_onboarding")
public class PatientOnboarding extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false, unique = true)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    private OnboardingStep prevStep;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OnboardingStep currentStep;

    @Enumerated(EnumType.STRING)
    private OnboardingStep nextStep;

    @Column(nullable = false)
    private Boolean locked = false;
}
