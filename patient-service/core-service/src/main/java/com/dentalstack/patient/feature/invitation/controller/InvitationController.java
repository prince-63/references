package com.dentalstack.patient.feature.invitation.controller;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.invitation.dto.*;
import com.dentalstack.patient.feature.invitation.dto.ChangeInvitationStatusByPatient;
import com.dentalstack.patient.feature.invitation.dto.ChangeNewInvitationStatusByDoctorRequest;
import com.dentalstack.patient.feature.invitation.dto.PatientNewInvitationDetails;
import com.dentalstack.patient.feature.invitation.service.InvitationService;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Invitation", description = "APIs for the inviting users")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/new/invitation/v1/")
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping("/patient")
    @Operation(summary = "Invite a new patient")
    @Transactional
    public ResponseEntity<InvitationDetails> inviteUser(@Valid @RequestBody InvitePatientRequest request) {
        return ResponseEntity.ok(InvitationDetails.from(invitationService.invitePatient(request)));
    }

    @GetMapping("/by/doctor/{doctor_id}")
    @Operation(summary = "Fetch all the invitation to the patient by particular doctor")
    public List<AllInvitationDetails> getAllPatientInvitationsByDoctor(@PathVariable("doctor_id") Long doctorId) {
        return invitationService.getDoctorAllInvitation(doctorId);
    }

    @PostMapping("/update")
    @Operation(summary = "Update invitation")
    @Transactional
    public ResponseEntity<InvitationDetails> updateRequest(@RequestBody UpdateInvitationRequest request) {
        return ResponseEntity.ok(InvitationDetails.from(invitationService.updateInvitation(request)));
    }

    @PostMapping("/patient/status/change")
    @Operation(summary = "Approve or reject the invitation to the patient")
    public ResponseEntity<PatientNewInvitationDetails> changePatientInvitationStatusByPatient(
            @RequestBody ChangeInvitationStatusByPatient request) {
        return ResponseEntity.ok(invitationService.changePatientInvitationStatusByPatient(request));
    }

    @PostMapping("/doctor/status/change")
    @Operation(summary = "Cancel or resend the invitation to the patient")
    public ResponseEntity<PatientNewInvitationDetails> changePatientInvitationStatusByDoctor(
            @RequestBody ChangeNewInvitationStatusByDoctorRequest request) {
        return ResponseEntity.ok(invitationService.changePatientInvitationStatusByDoctor(request));
    }

    @GetMapping("/notify/patient/{patient_id}/{doctor_name}")
    @Operation(summary = "Notify patient for invitation")
    @Deprecated
    @Transactional
    public ResponseEntity<InvitationDetails> notifyPatient(
            @PathVariable("patient_id") long patientId, @PathVariable("doctor_name") String doctorName) {
        return ResponseEntity.ok(InvitationDetails.from(invitationService.notifyPatient(patientId, doctorName)));
    }

    @PostMapping("/notify/patient")
    @Operation(summary = "Notify patient for invitation")
    @Transactional
    public ResponseEntity<InvitationDetails> notifyPatient(@Valid @RequestBody NotifyPatientRequest request) {
        return ResponseEntity.ok(InvitationDetails.from(invitationService.notifyPatient(request)));
    }

    @GetMapping("/get/doctor/{patient_id}")
    @Operation(summary = "Get doctor details")
    public DoctorDetails getDoctorDetails(@PathVariable("patient_id") Long patientId) {
        return invitationService.getDoctorDetails(patientId);
    }

    @GetMapping("/doctor/details/{email}")
    @Operation(summary = "Get doctor details")
    public DoctorDetails getDoctorByPatientEmail(@PathVariable("email") String email) {
        return invitationService.getDoctorDetails(email);
    }

    @PostMapping("/convert-lead-to-patient")
    @Operation(summary = "Convert lead to patient")
    public ResponseEntity<PatientDetails> convertLeadToPatient(@RequestParam Long patientId) {
        return ResponseEntity.ok((invitationService.convertLeadToPatient(patientId)));
    }

    @PostMapping("/validate-patient")
    @Operation(summary = "Check if the patient is valid")
    public ValidateInvitationResponse validatePatient(@Valid @RequestBody ValidateInvitationRequest request) {
        return invitationService.validationPatientInvitation(request);
    }

    @PostMapping("/create-task-tracker")
    public void createTaskTrackerForInvitations(@RequestBody PatientCustomerCreateTaskTrackerRequest request) {
        invitationService.createPatientTaskTrackerThrowSignup(
                request.getPatientId(), request.getPracticeProfileId(), request.getParentTaskTrackerId());
    }
}
