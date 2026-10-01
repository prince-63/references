package com.dentalstack.patient.feature.patient_onboarding.controller;

import com.dentalstack.patient.feature.patient_onboarding.dto.PatientOnboardingResponse;
import com.dentalstack.patient.feature.patient_onboarding.dto.PatientOnboardingStepRequest;
import com.dentalstack.patient.feature.patient_onboarding.service.PatientOnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/onboarding")
@RequiredArgsConstructor
@Tag(name = "Onboarding Onboarding", description = "Onboarding Onboarding API")
public class PatientOnboardingController {

    private final PatientOnboardingService service;

    @PostMapping("/move")
    @Operation(summary = "Move patient app screen")
    public ResponseEntity<PatientOnboardingResponse> moveStep(@RequestBody PatientOnboardingStepRequest request) {
        return ResponseEntity.ok(PatientOnboardingResponse.from(
                service.moveStep(request.getPatientId(), request.getNextStep(), request.getForceMoveComplete())));
    }

    @Operation(summary = "get patient onboarding status")
    @GetMapping("/status/{patient_id}")
    public ResponseEntity<PatientOnboardingResponse> getStatus(@PathVariable(name = "patient_id") Long patientId) {
        return ResponseEntity.ok(PatientOnboardingResponse.from(service.getStatus(patientId)));
    }
}
