package com.dentalstack.patient.feature.patient.controller;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.dto.RegisterPatientRequest;
import com.dentalstack.patient.feature.patient.service.UnassignedPatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Patient Lead", description = "APIs for the Patient lead")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/unassigned/v1")
public class UnassignedPatientController {

    private final UnassignedPatientService unassignedPatientService;

    @PostMapping("/auth/register")
    @Operation(summary = "Register a new patient from auth")
    public PatientDetails registerPatientFromAuth(@RequestBody RegisterPatientRequest request) {
        return (PatientDetails.from(unassignedPatientService.registerPatient(request)));
    }
}
