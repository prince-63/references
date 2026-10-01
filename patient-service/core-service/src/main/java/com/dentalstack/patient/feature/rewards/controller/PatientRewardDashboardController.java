package com.dentalstack.patient.feature.rewards.controller;

import com.dentalstack.patient.feature.rewards.dto.response.PatientRewardDashboardResponse;
import com.dentalstack.patient.feature.rewards.service.PatientRewardDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/patient/rewards/dashboard")
@RequiredArgsConstructor
public class PatientRewardDashboardController {

    private final PatientRewardDashboardService dashboardService;

    @GetMapping
    public ResponseEntity<PatientRewardDashboardResponse> getDashboard(@RequestHeader("patientId") Long patientId) {
        PatientRewardDashboardResponse response = dashboardService.getDashboard(patientId);
        return ResponseEntity.ok(response);
    }
}
