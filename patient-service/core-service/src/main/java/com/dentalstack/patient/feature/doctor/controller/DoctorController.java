package com.dentalstack.patient.feature.doctor.controller;

import com.dentalstack.patient.feature.doctor.dto.*;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Doctor api", description = "APIs to perform actions on doctor")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/doctor/v1")
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/deactivate/subscription")
    @Operation(summary = "deactivate the user login")
    public void deactivateSubscription(@Valid @RequestBody DeactivateSubscription request) {
        doctorService.deactivateSubscription(request);
    }

    @GetMapping("/mini-dashboard/{profileId}/{organizationId}")
    @Operation(summary = "Get mini dashboard details for doctor profile")
    public ResponseEntity<MiniDashboardDetailsResponse> getMiniDashboardDetails(
            @PathVariable Long profileId, @PathVariable Long organizationId) {
        MiniDashboardDetailsResponse response = doctorService.getMiniDashboardDetails(profileId, organizationId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/super-admin/details")
    @Operation(summary = "Get super admin details")
    public SuperAdminResponse getSuperAdminDetails(@Valid @RequestBody SuperAdminRequest request) {
        return doctorService.getSuperAdminDetails(request);
    }
}
