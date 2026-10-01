package com.dentalstack.patient.feature.doctor.controller;

import com.dentalstack.patient.feature.doctor.dto.DoctorDashboardRequest;
import com.dentalstack.patient.feature.doctor.dto.DoctorDashboardResponseV3;
import com.dentalstack.patient.feature.doctor.service.DashboardServiceV3;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Doctor dashboard v3", description = "Doctor dashboard APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/doctor/dashboard/v3")
public class DoctorDashboardControllerV3 {

    private final DashboardServiceV3 dashboardServiceV3;

    @PostMapping("/")
    @Operation(summary = "Get doctor dashboard data")
    public ResponseEntity<DoctorDashboardResponseV3> getDoctorDashboardData(
            @Valid @RequestBody DoctorDashboardRequest request) {
        return ResponseEntity.ok(dashboardServiceV3.getDoctorDashboardData(request));
    }
}
