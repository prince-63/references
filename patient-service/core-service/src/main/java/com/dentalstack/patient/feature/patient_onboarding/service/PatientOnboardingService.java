package com.dentalstack.patient.feature.patient_onboarding.service;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient_onboarding.entity.PatientOnboarding;
import com.dentalstack.patient.feature.patient_onboarding.enums.OnboardingStep;
import com.dentalstack.patient.feature.patient_onboarding.exception.InvalidOnboardingTransitionException;
import com.dentalstack.patient.feature.patient_onboarding.repository.PatientOnboardingRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientOnboardingService {

    private final PatientOnboardingRepository repository;

    private static final Map<OnboardingStep, OnboardingStep> FLOW = Map.of(
            OnboardingStep.NOT_STARTED, OnboardingStep.REMINDER_SETUP_COMPLETED,
            OnboardingStep.REMINDER_SETUP_COMPLETED, OnboardingStep.ALIGNER_TIME_SELECTED,
            OnboardingStep.ALIGNER_TIME_SELECTED, OnboardingStep.NOTIFICATION_SELECTED,
            OnboardingStep.NOTIFICATION_SELECTED, OnboardingStep.LIVE_ACTIVITY_SELECTION_DONE,
            OnboardingStep.LIVE_ACTIVITY_SELECTION_DONE, OnboardingStep.COMPLETED);

    @Transactional
    public PatientOnboarding initialize(Patient patient) {
        OnboardingStep startStep = OnboardingStep.NOT_STARTED;
        PatientOnboarding onboarding = PatientOnboarding.builder()
                .patient(patient)
                .prevStep(null)
                .currentStep(startStep)
                .nextStep(FLOW.get(startStep))
                .locked(false)
                .build();
        return repository.save(onboarding);
    }

    @Transactional
    public PatientOnboarding moveStep(Long patientId, String stepStr, Boolean forceMoveComplete) {
        PatientOnboarding onboarding =
                repository.findByPatientId(patientId).orElseThrow(() -> new RuntimeException("Onboarding not found"));
        if (Boolean.TRUE.equals(onboarding.getLocked())) {
            throw new InvalidOnboardingTransitionException("Onboarding already completed");
        }
        OnboardingStep requestedStep;
        try {
            requestedStep = OnboardingStep.valueOf(stepStr);
        } catch (IllegalArgumentException e) {
            throw new InvalidOnboardingTransitionException("Invalid onboarding step");
        }
        if (forceMoveComplete) {
            onboarding.setPrevStep(onboarding.getCurrentStep());
            onboarding.setCurrentStep(requestedStep);
            onboarding.setNextStep(null);
        } else {
            if (!requestedStep.equals(onboarding.getNextStep())) {
                throw new InvalidOnboardingTransitionException("Invalid step transition");
            }
            onboarding.setPrevStep(onboarding.getCurrentStep());
            onboarding.setCurrentStep(requestedStep);
            onboarding.setNextStep(FLOW.get(requestedStep));
        }
        if (requestedStep == OnboardingStep.COMPLETED) {
            onboarding.setLocked(true);
        }
        return repository.save(onboarding);
    }

    public PatientOnboarding getStatus(Long patientId) {
        return repository.findByPatientId(patientId).orElseThrow(() -> new RuntimeException("Onboarding not found"));
    }
}
