package com.dentalstack.patient.feature.workflow.pre_treatment;

import com.dentalstack.patient.feature.workflow.pre_treatment.dto.PatientPreTreatmentRequest;
import com.dentalstack.patient.feature.workflow.pre_treatment.dto.PatientPreTreatmentResponse;
import com.dentalstack.patient.feature.workflow.pre_treatment.service.PatientPreTreatmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Pre treatment patient details", description = "Pre treatment patient details api's")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/pre-treatment")
public class PatientPreTreatmentController {

    private final PatientPreTreatmentService preTreatmentService;

    @Operation(summary = "Create pre-treatment details", description = "Create new pre-treatment details for a patient")
    @PostMapping
    public ResponseEntity<PatientPreTreatmentResponse> createPreTreatmentDetails(
            @Valid @RequestBody PatientPreTreatmentRequest request) {
        PatientPreTreatmentResponse response = preTreatmentService.createPreTreatmentDetails(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update pre-treatment details", description = "Update existing pre-treatment details")
    @PutMapping("/{id}")
    public ResponseEntity<PatientPreTreatmentResponse> updatePreTreatmentDetails(
            @PathVariable Long id, @Valid @RequestBody PatientPreTreatmentRequest request) {
        PatientPreTreatmentResponse response = preTreatmentService.updatePreTreatmentDetails(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get pre-treatment details", description = "Get pre-treatment details by ID")
    @GetMapping("/{patientId}")
    public ResponseEntity<PatientPreTreatmentResponse> getPreTreatmentDetails(@PathVariable Long id) {
        PatientPreTreatmentResponse response = preTreatmentService.getPreTreatmentDetails(id);
        return ResponseEntity.ok(response);
    }
}
