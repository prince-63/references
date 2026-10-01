package com.dentalstack.patient.feature.doctor.controller;

import com.dentalstack.patient.feature.aligner.dto.aligner.UpcomingAlignerChangesDetails;
import com.dentalstack.patient.feature.appointment.dto.MobileDashboardDoctorDetails;
import com.dentalstack.patient.feature.doctor.dto.*;
import com.dentalstack.patient.feature.doctor.service.DoctorDashboardService;
import com.dentalstack.patient.feature.invitation.dto.AllInvitationDetails;
import com.dentalstack.patient.feature.invitation.dto.NotSetUpTreatmentPatient;
import com.dentalstack.patient.feature.invitation.service.InvitationService;
import com.dentalstack.patient.feature.notification.dto.ChatPatientResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Doctor dashboard", description = "Doctor dashboard APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/doctor/dashboard/v1")
@Slf4j
public class DoctorDashboardController {

    private final DoctorDashboardService doctorDashboardService;

    private final InvitationService invitationService;

    @Operation(
            summary =
                    "In this returning the response of the total active patient and the practice location of the doctor")
    @GetMapping("/get/count")
    public DashboardCounts getCountsForDoctor(@RequestParam(value = "doctorId", required = false) Long doctorId) {
        return doctorDashboardService.getCount(doctorId);
    }

    @Operation(
            summary =
                    "In this returning the response of the list of patient which are mapped to the doctor and practice location of that patient")
    @PostMapping("/get/list")
    public ResponseEntity<?> getDoctorPatientListDetails(
            @Valid @RequestBody DoctorRequestForPatientDetails doctorRequestForPatientDetails) {

        List<DoctorPatientDetails> doctorPatientDetails =
                doctorDashboardService.getPatientDetails(doctorRequestForPatientDetails);
        return ResponseEntity.ok(doctorPatientDetails);
    }

    @GetMapping("/list/by/patientId")
    @Deprecated
    public List<PatientResponse> getPatientListResponse(
            @RequestParam(value = "patientId", required = false) List<Long> patientId) {
        return doctorDashboardService.getPatinetList(patientId);
    }

    @GetMapping("/by/patientId")
    public ChatPatientResponse getPatientForChat(@RequestParam(value = "patientId", required = false) Long patientId) {
        return doctorDashboardService.getPatientForChat(patientId);
    }

    @Operation(summary = "Get the patient details by filter")
    @PostMapping("/filter")
    public ResponseEntity<List<DoctorPatientDetails>> getFilteredPatients(
            @Valid @RequestBody FilterPatientRequest filterPatientRequest) {

        List<DoctorPatientDetails> filteredPatient = doctorDashboardService.filterPatients(filterPatientRequest);

        return ResponseEntity.ok(filteredPatient);
    }

    @GetMapping("/without/treatment/list")
    public List<NotSetUpTreatmentPatient> getPatientWhoNotHaveTreatment(
            @RequestParam(value = "doctorId", required = false) Long doctorId) {
        return doctorDashboardService.withoutTreatmentPatient(doctorId);
    }

    @GetMapping("/get/aligner/id/{patient_id}")
    Long getAlignerJourneyIdOfPatient(@PathVariable("patient_id") Long id) {
        return doctorDashboardService.getAlignerJourneyIdOfPatient(id);
    }

    @GetMapping("/upcoming/aligner/change/{doctor_id}/{organization_id}")
    @Operation(summary = "Get upcoming aligner changes")
    public ResponseEntity<UpcomingAlignerChangesDetails> getUpcomingAlignerChange(
            @PathVariable("doctor_id") long doctorId, @PathVariable("organization_id") long organizationId) {
        return ResponseEntity.ok(doctorDashboardService.upcomingAlignerChange(doctorId, organizationId));
    }

    @GetMapping("/doctor/dashboard")
    public ResponseEntity<?> getDoctorDashboardData(
            @RequestParam(value = "doctorId") Long doctorId, @RequestParam(value = "operation") String operation) {
        switch (operation) {
            case "WAITING_LIST" -> {
                return ResponseEntity.ok(doctorDashboardService.getWaitingListPatientNew(doctorId));
            }
            case "AWAITING_TREATMENT_PLAN" -> {
                return ResponseEntity.ok(doctorDashboardService.withoutTreatmentPatient(doctorId));
            }
            case "INVITATION_SENT" -> {
                List<AllInvitationDetails> sentInvitations = invitationService.getDoctorAllInvitation(doctorId);
                return ResponseEntity.ok(sentInvitations);
            }
            case "ALL" -> {
                List<WaitingListPatientResponse> waitingListData =
                        doctorDashboardService.getWaitingListPatientNew(doctorId);
                List<NotSetUpTreatmentPatient> awaitingTreatmentData =
                        doctorDashboardService.withoutTreatmentPatient(doctorId);
                List<AllInvitationDetails> sentInvitationsData = invitationService.getDoctorAllInvitation(doctorId);
                AllLeadDetails allLeadDetails =
                        new AllLeadDetails(waitingListData, awaitingTreatmentData, sentInvitationsData);
                return ResponseEntity.ok(allLeadDetails);
            }
            default -> throw new IllegalArgumentException("Invalid API specified: " + operation);
        }
    }

    @GetMapping("/doctor/mobile/dashboard")
    public ResponseEntity<MobileDashboardDoctorDetails> getDoctorMobileDashboardData(
            @RequestParam(value = "doctorId") Long doctorId) {
        MobileDashboardDoctorDetails doctorMobileDashboardData =
                doctorDashboardService.getDoctorMobileDashboardData(doctorId);
        return ResponseEntity.ok(doctorMobileDashboardData);
    }

    @GetMapping("/leads/details/{doctor_id}")
    @Operation(summary = "Doctor web lead details")
    public List<DashboardLeadDetails> getDoctorLeadData(@PathVariable("doctor_id") Long doctorId) {
        return doctorDashboardService.getWebLeadData(doctorId);
    }
}
