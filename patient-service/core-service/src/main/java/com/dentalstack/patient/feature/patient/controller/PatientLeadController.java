package com.dentalstack.patient.feature.patient.controller;

import com.dentalstack.patient.feature.doctor.dto.DashboardLeadDetails;
import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.service.PatientLeadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Patient lead", description = "Lead's details APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/lead/v1")
public class PatientLeadController {

    private final PatientLeadService patientLeadService;

    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @GetMapping("/all/details/{doctor_id}")
    @Operation(summary = "Doctor web lead details")
    public ResponseEntity<List<DashboardLeadDetails>> getDoctorLead(@PathVariable("doctor_id") Long doctorId) {
        return ResponseEntity.ok(patientLeadService.getWebLead(doctorId));
    }

    @GetMapping("/profile/overview/{patient_id}/{doctor_id}")
    @Operation(summary = "Doctor web leads profile overview")
    public ResponseEntity<LeadProfileOverviewResponse> getLeadProfileOverview(
            @PathVariable("patient_id") Long patientId, @PathVariable("doctor_id") Long doctorId) {
        return ResponseEntity.ok(patientLeadService.getLeadProfileOverview(patientId, doctorId));
    }

    @PostMapping("/status/change")
    public ResponseEntity<String> changeLeadStatus(@Valid @RequestBody LeadStatusChangeRequest request) {
        patientLeadService.changeLeadStatus(request.getPatientId(), request.getStatus());
        return ResponseEntity.ok("Status changed successfully");
    }

    @GetMapping("/by/status")
    public ResponseEntity<List<ArchivedLeadDetails>> getPatientWithStatus(
            @RequestParam(value = "doctorId") Long doctorId, @RequestParam(value = "Status") String patientStatus) {
        return ResponseEntity.ok(patientLeadService.getPatientWithStatus(doctorId, patientStatus));
    }

    @PostMapping("/by/status")
    public ResponseEntity<List<ArchivedLeadDetails>> getPatientWithStatus(
            @Valid @RequestBody ArchivedLeadRequest request) {
        return ResponseEntity.ok(patientLeadService.getPatientWithStatus(request));
    }

    @PostMapping("/filter")
    public ResponseEntity<List<DashboardLeadDetails>> filterPatientsPost(
            @Valid @RequestBody FilterPatientsRequest request) {
        List<DashboardLeadDetails> filteredPatients = patientLeadService.filterPatients(request);
        return ResponseEntity.ok(filteredPatients);
    }

    @GetMapping("/current-step/{patientId}")
    @Operation(summary = "Get patient get current step")
    public ResponseEntity<PatientCurrStepResponse> getPatientCurrentStep(@PathVariable Long patientId) {
        return ResponseEntity.ok(patientLeadService.getPatientCurrentStep(patientId));
    }

    @PatchMapping("/current-step")
    @Operation(summary = "Update patient current step")
    public ResponseEntity<PatientCurrStepResponse> updatePatientCurrentStep(
            @RequestParam("patientId") Long patientId,
            @RequestParam(value = "currentStep", defaultValue = "0") Long currentStep) {
        return ResponseEntity.ok(patientLeadService.updatePatientCurrentStep(patientId, currentStep));
    }

    @PostMapping("/update")
    @Operation(summary = "Update the lead details")
    public ResponseEntity<DashboardLeadDetails> updatePatient(@Valid @RequestBody UpdateLeadDetails req) {
        return ResponseEntity.ok((patientLeadService.updatePatient(req)));
    }
}
