package com.dentalstack.patient.feature.patient.controller.v2;

import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.service.PatientProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "profile", description = "Patient profile APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/v3")
public class PatientControllerV3 {

    private final PatientProfileService patientProfileService;

    @PostMapping("/")
    @Operation(summary = "Get patient by doctor")
    public ResponseEntity<PatientDetailsV3> getPatientDetails(@Valid @RequestBody PatientGetRequest request) {
        return ResponseEntity.ok(patientProfileService.getPatientDetailsV3(request));
    }

    @PostMapping("/current-step")
    @Operation(summary = "Get patient get current step")
    public ResponseEntity<PlanningStepperResponse> getPatientCurrentStep(
            @Valid @RequestBody PatientGetRequest request) {
        return ResponseEntity.ok(patientProfileService.getPatientCurrentStep(request));
    }
}
