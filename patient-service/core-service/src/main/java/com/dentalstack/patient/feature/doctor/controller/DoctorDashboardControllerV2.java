package com.dentalstack.patient.feature.doctor.controller;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.PendingPatientActionCategorizedResponse;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.PendingPatientActionRequest;
import com.dentalstack.patient.feature.doctor.dto.*;
import com.dentalstack.patient.feature.doctor.service.DoctorDashboardService;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Doctor dashboard v2", description = "Doctor dashboard APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/doctor/dashboard/v2")
public class DoctorDashboardControllerV2 {

    private final DoctorDashboardService doctorDashboardService;
    private final DoctorService doctorService;

    @Operation(summary = "Doctor dashboard counts")
    @GetMapping("/get/count/{doctor_id}/{organization_id}/{profile_id}")
    public ResponseEntity<DoctorDashboardCount> getCountsForDoctor(
            @PathVariable("doctor_id") Long doctorId,
            @PathVariable("organization_id") Long organizationId,
            @PathVariable("profile_id") Long profileId) {
        return ResponseEntity.ok(doctorDashboardService.getDashboardCount(doctorId, organizationId, profileId));
    }

    @PostMapping("/pending/action")
    @Operation(summary = "Get pending action of the all patient")
    public ResponseEntity<PendingPatientActionCategorizedResponse> pendingPatientActionResponse(
            @Valid @RequestBody PendingPatientActionRequest request) {
        return ResponseEntity.ok(doctorDashboardService.pendingPatientActionResponse(request));
    }

    @GetMapping("/chat")
    @Operation(summary = "Get patient details of a chat")
    List<PatientResponse> getPatientDetailsForChatDashboard(
            @RequestParam(value = "doctorId") Long doctorId,
            @RequestParam(value = "organizationId") Long organizationId,
            @RequestParam(value = "profileId") Long profileId) {
        return doctorDashboardService.getPatientDetailsForChatDashboard(doctorId, organizationId, profileId);
    }

    @PostMapping("/mini-dashboard")
    @Operation(summary = "Get mini dashboard details for doctor profile")
    public ResponseEntity<MiniDashboardDetailsResponse> getMiniDashboardDetails(
            @RequestBody MiniDashboardRequest request) {
        MiniDashboardDetailsResponse response = doctorService.getMiniDashboardDetails(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mini-dashboard/customer")
    @Operation(summary = "Get mini dashboard details for doctor profile")
    public ResponseEntity<MiniDashboardDetailsResponse> getMiniDashboardDetailsForCustomer(
            @RequestBody MiniDashboardRequestForCustomer request) {
        MiniDashboardDetailsResponse response = doctorService.getMiniDashboardDetailsForCustomer(request);
        return ResponseEntity.ok(response);
    }
}
