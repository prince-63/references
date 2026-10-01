package com.dentalstack.patient.feature.patient.controller;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.patient.dto.ActivePatientRequest;
import com.dentalstack.patient.feature.patient.dto.CombinedPatientResponseWithPagination;
import com.dentalstack.patient.feature.patient.dto.PatientCountDTO;
import com.dentalstack.patient.feature.patient.service.PatientListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Patient all list", description = "Aligner v2 APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/list/v1")
public class PatientListController {

    private final PatientListService patientListService;

    @PostMapping("/all")
    @Operation(summary = "Get the all patient list")
    public ResponseEntity<CombinedPatientResponseWithPagination> getAllPatientList(
            @Valid @RequestBody ActivePatientRequest request) {
        return ResponseEntity.ok(patientListService.getAllPatients(request));
    }

    @GetMapping("/all/count/{doctor_id}/{organization_id}/{profile_id}/{role}")
    @Operation(summary = "Get the all patient count")
    public ResponseEntity<PatientCountDTO> getAllPatientsCount(
            @PathVariable("doctor_id") Long doctorId,
            @PathVariable("organization_id") Long organizationId,
            @PathVariable("profile_id") Long profileId,
            @PathVariable("role") DoctorRole role) {
        return ResponseEntity.ok(patientListService.getAllPatientMetrics(doctorId, organizationId, profileId, role));
    }
}
