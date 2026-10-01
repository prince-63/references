package com.dentalstack.patient.feature.doctor.controller;

import com.dentalstack.patient.feature.doctor.dto.DoctorDashboardRequest;
import com.dentalstack.patient.feature.doctor.dto.DoctorDashboardResponseV4;
import com.dentalstack.patient.feature.doctor.dto.MiniDashboardDetailsResponse;
import com.dentalstack.patient.feature.doctor.dto.MiniDashboardRequest;
import com.dentalstack.patient.feature.doctor.service.DashboardServiceV3;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Doctor dashboard v3", description = "Doctor dashboard APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/doctor/dashboard/v4")
public class DoctorDashboardControllerV4 {

    private final DashboardServiceV3 dashboardServiceV3;

    @PostMapping("/")
    @Operation(summary = "Get doctor dashboard data")
    public ResponseEntity<DoctorDashboardResponseV4> getDoctorDashboardData(
            @Valid @RequestBody DoctorDashboardRequest request) {
        return ResponseEntity.ok(dashboardServiceV3.getDoctorDashboardDataV4(request));
    }

    @PostMapping("/mini-dashboard")
    @Operation(summary = "Get mini dashboard details for doctor profile")
    public ResponseEntity<MiniDashboardDetailsResponse> getMiniDashboardDetails(
            @RequestBody MiniDashboardRequest request) {
        MiniDashboardDetailsResponse response = dashboardServiceV3.getMiniDashboardDetails(request);
        return ResponseEntity.ok(response);
    }
}
