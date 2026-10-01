package com.dentalstack.patient.feature.patient.controller;

import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.service.PatientProfileService;
import com.dentalstack.patient.feature.storage.files.dto.ToggleStlFileViewRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "profile", description = "Patient profile APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/v2")
public class PatientController {

    private final PatientProfileService patientProfileService;

    @GetMapping("/")
    @Operation(summary = "Get the patient details or get the list of patient")
    public ResponseEntity<?> getPatients(
            @RequestParam Long doctorId,
            @RequestParam(value = "patient_id", required = false) Long patientId,
            @RequestParam(required = false) String status) {
        if (patientId != null) {
            PatientResponseMobile patientResponse = patientProfileService.getPatientById(patientId);
            return ResponseEntity.ok(patientResponse);
        } else {
            List<PatientResponseMobile> patients = patientProfileService.getPatientsByDoctorId(doctorId, status);
            return ResponseEntity.ok(patients);
        }
    }

    @GetMapping("/{doctor_id}")
    @Deprecated
    @Operation(summary = "Get all patient by doctor")
    public ResponseEntity<List<PatientResponseForCalender>> getAllPatients(@PathVariable("doctor_id") Long doctorId) {
        return ResponseEntity.ok(patientProfileService.getAllPatients(doctorId, null, null));
    }

    @PostMapping("/all")
    @Operation(summary = "Get all patient by doctor")
    public ResponseEntity<List<PatientResponseForCalender>> getAllPatients(
            @Valid @RequestBody PatientGetAllRequest request) {
        return ResponseEntity.ok(patientProfileService.getAllPatients(
                request.getDoctorId(), request.getProfileId(), request.getOrganizationId()));
    }

    @GetMapping("getting/started/{doctor_id}/{patient_id}")
    @Operation(summary = "Get patient getting started details")
    public ResponseEntity<GettingStartedDetails> gettingStarted(
            @PathVariable("doctor_id") Long doctorId, @PathVariable("patient_id") Long patientId) {
        return ResponseEntity.ok(patientProfileService.gettingStartedDetails(doctorId, patientId));
    }

    @Operation(summary = "Getting started make mark all as read")
    @PostMapping("mark/as/read")
    public void gettingStartedMakeMarkAllAsRead(@Valid @RequestBody GettingStartedMarkAsReadRequest request) {
        patientProfileService.gettingStartedMakeMarkAllAsRead(request);
    }

    @GetMapping("/overview/details")
    @Operation(summary = "Get the patient overview details")
    public PatientOverviewDetails getPatientOverviewDetails(
            @RequestParam Long doctorId,
            @RequestParam Long patientId,
            @RequestParam(required = false) Long patientTaskTrackerId,
            @RequestHeader String authorization) {
        return patientProfileService.patientOverviewDetails(doctorId, patientId, authorization, patientTaskTrackerId);
    }

    @PostMapping("/overview/details")
    @Operation(summary = "Get the patient overview details")
    public PatientOverviewDetails getPatientOverviewDetails(@RequestBody PatientOverviewDetailsRequest request) {
        return patientProfileService.patientOverviewDetails(request);
    }

    @GetMapping("/patient-connection-details")
    @Operation(summary = "Get the patient connection details")
    public PatientConnectionDetails patientConnectionDetails(
            @RequestParam String email,
            @RequestParam(value = "patient_id", required = false) Long patientId,
            @RequestParam(value = "org_name", required = false) String orgName) {
        return patientProfileService.patientConnectionDetails(email, patientId, orgName);
    }

    @PostMapping("/toggle-stl-view")
    public void toggleStlFileView(@RequestBody ToggleStlFileViewRequest request) {
        patientProfileService.toggleStlFileView(request);
    }

    @PostMapping("/toggle-is-tracking")
    public void toggleTracking(@RequestBody ToggleTrackingRequest request) {
        patientProfileService.toggleIsTrackingForCustomer(request);
    }
}
