package com.dentalstack.patient.feature.patient.controller;

import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.service.PatientProfileService;
import com.dentalstack.patient.global.exception.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "profile", description = "Patient profile APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/profile/v1")
public class PatientProfileController {

    private final PatientProfileService profileService;

    @PostMapping("/register")
    @Operation(summary = "Register a new patient")
    @Transactional
    public ResponseEntity<PatientDetails> registerPatient(@RequestBody RegisterPatientRequest request) {
        return ResponseEntity.ok(PatientDetails.from(profileService.registerPatient(request)));
    }

    @PostMapping("/auth/register")
    @Operation(summary = "Register a new patient from auth")
    @Transactional
    public PatientDetails registerPatientFromAuth(@RequestBody RegisterPatientRequest request) {
        return (PatientDetails.from(profileService.registerPatient(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Fetch the patient details by Id")
    public ResponseEntity<PatientDetails> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(profileService.getPatientDetails(id));
    }

    @GetMapping("/")
    @Operation(summary = "Fetch the patient details")
    @Transactional(readOnly = true)
    public ResponseEntity<PatientDetails> getPatient(
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "mobile_no", required = false) String mobileNo,
            @RequestParam(value = "UUID", required = false) String UUID,
            @RequestParam(value = "doctorId", required = false) Long doctorId) {
        if (email == null && mobileNo == null && UUID == null) {
            throw new BadRequestException("At least one of the `email`, `mobile no` or `UUID` must be sent");
        }
        return ResponseEntity.ok(PatientDetails.from(profileService.getPatient(email, mobileNo, UUID, doctorId)));
    }

    @GetMapping("/email")
    @Operation(summary = "Fetch the patient details with email")
    @Transactional(readOnly = true)
    public PatientDetails getPatientByEmail(@RequestParam(value = "email", required = false) String email) {
        Patient patient = profileService.getPatientWithEmail(email);

        if (patient == null) {
            return null;
        }
        return PatientDetails.from(patient);
    }

    @GetMapping("/uuid/{UUID}")
    @Operation(summary = "Fetch the patient details by UUID")
    public ResponseEntity<PatientDetails> getPatientByUuid(@PathVariable(value = "UUID") String UUID) {
        return ResponseEntity.ok(profileService.getPatientByUUID(UUID));
    }

    @PatchMapping
    @Operation(summary = "Update the patient details")
    @Transactional
    public ResponseEntity<PatientDetails> updatePatient(@Valid @RequestBody UpdatePatientRequest req) {
        return ResponseEntity.ok(PatientDetails.from(profileService.updatePatient(req)));
    }

    @PostMapping(
            value = "/{patient_id}/profile_picture",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update profile picture of the patient")
    public ResponseEntity<PatientDetails> updateProfilePicture(
            @PathVariable("patient_id") Long patientId, @RequestPart("photo") MultipartFile photo) {
        return ResponseEntity.ok(profileService.updateProfilePictureAndGetDetails(patientId, photo));
    }

    @PostMapping("/address")
    @Operation(summary = "Add the patient address")
    @Transactional
    public ResponseEntity<PatientDetails> addPatient(@Valid @RequestBody AddPatientAddressRequest req) {
        return ResponseEntity.ok(
                PatientDetails.from(profileService.addPatientAddresses(req.getPatientId(), req.getAddresses())));
    }

    @PatchMapping("/address")
    @Operation(summary = "Update the existing patient address")
    @Transactional
    public ResponseEntity<PatientDetails> updatePatientAddress(@RequestBody UpdatePatientAddressRequest request) {
        return ResponseEntity.ok(PatientDetails.from(profileService.updatePatientAddress(request)));
    }

    @PostMapping("/delete/{patient_id}")
    @Operation(summary = "Delete a patient")
    public ResponseEntity<String> deleteNote(@PathVariable("patient_id") Long patientId) {
        profileService.delete(patientId);
        return ResponseEntity.ok("Patient deleted successfully");
    }

    @PostMapping("/update/language")
    @Operation(summary = "Update the language")
    @Transactional
    public PatientDetails updateLanguage(@RequestBody UpdateLanguage request) {
        return (PatientDetails.from(profileService.updateLanguage(request)));
    }

    @DeleteMapping("/delete/{email}")
    @Operation(summary = "Delete a patient - Self triggered")
    public ResponseEntity<String> deleteByEmail(@PathVariable("email") String email) {
        profileService.deleteByEmail(email);
        return ResponseEntity.ok("Patient deleted successfully");
    }
}
