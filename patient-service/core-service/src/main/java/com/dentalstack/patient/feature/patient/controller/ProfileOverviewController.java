package com.dentalstack.patient.feature.patient.controller;

import com.dentalstack.patient.feature.patient.dto.PatientProfileOverviewActionRequest;
import com.dentalstack.patient.feature.patient.dto.PatientProfileOverviewActionResponse;
import com.dentalstack.patient.feature.patient.service.ProfileOverviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Patient profile overview", description = "Patient profile overview")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/profile/overview/v1")
@Slf4j
public class ProfileOverviewController {
    private final ProfileOverviewService profileOverviewService;

    @PostMapping("/actions")
    @Operation(summary = "Get patient profile overview actions details")
    public ResponseEntity<PatientProfileOverviewActionResponse> getPatientOverviewActions(
            @Valid @RequestBody PatientProfileOverviewActionRequest request) {
        return ResponseEntity.ok(profileOverviewService.getPatientOverviewActions(request));
    }
}
