package com.dentalstack.patient.feature.treatment.controller;

import com.dentalstack.patient.feature.patient.dto.PatientTreatmentSummary;
import com.dentalstack.patient.feature.treatment.service.SummaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Patient treatment summary", description = "Summary APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/summary/v1")
@Slf4j
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping("/{patient_id}")
    @Operation(summary = "Get the treatments summary of the patient")
    public ResponseEntity<PatientTreatmentSummary> getPatientSummaryDetails(
            @PathVariable("patient_id") Long patientId) {
        return ResponseEntity.ok(summaryService.getPatientSummaryDetails(patientId));
    }
}
