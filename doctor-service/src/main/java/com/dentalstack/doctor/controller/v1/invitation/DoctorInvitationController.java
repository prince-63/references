package com.dentalstack.doctor.controller.v1.invitation;

import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.invitation.*;
import com.dentalstack.doctor.service.CustomerAccessAndRevokeService;
import com.dentalstack.doctor.service.invitation.DoctorInvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Invitation api", description = "Invitation APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/invitation/v1/")
@Slf4j
public class DoctorInvitationController {

    private final DoctorInvitationService doctorInvitationService;
    private final CustomerAccessAndRevokeService customerAccessAndRevokeService;

    @PostMapping("/")
    @Operation(summary = "Add or update practice")
    public ResponseEntity<DoctorInvitationDetails> inviteDoctor(
            @Valid @RequestBody DoctorInvitationRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(DoctorInvitationDetails.from(doctorInvitationService.inviteDoctor(request, xOrgName)));
    }

    @GetMapping("/{email}/{organization_id}/{inviter_doctor_id}")
    @Operation(summary = "Get doctor invitation details")
    public ResponseEntity<DoctorInvitationDetails> getInvitationDetails(
            @PathVariable("email") String email,
            @PathVariable("organization_id") long organizationId,
            @PathVariable("inviter_doctor_id") long inviterDoctorId) {
        return ResponseEntity.ok(DoctorInvitationDetails.from(
                doctorInvitationService.getDoctorInvitationDetails(email, organizationId, inviterDoctorId)));
    }

    @GetMapping("/{invite_code}")
    @Operation(summary = "Get doctor invitation details by invite code")
    public ResponseEntity<DoctorInvitationDetails> getDoctorInvitationDetailsByInviteCode(
            @PathVariable("invite_code") String inviteCode, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(doctorInvitationService.getDoctorInvitationDetailsByInviteCode(inviteCode, xOrgName));
    }

    @PostMapping("/active-or-pending")
    @Operation(summary = "Get the active or pending invitations list")
    public ResponseEntity<DoctorInvitationDetailsWithPagination> getActiveOrPendingInvitations(
            @Valid @RequestBody DoctorInvitationActiveOrPendingRequest request) {
        return ResponseEntity.ok(doctorInvitationService.getActiveOrPendingInvitations(request));
    }

    @PostMapping("/received")
    @Operation(summary = "Get the accepted invitations list")
    public ResponseEntity<List<LabDetails>> getAcceptedInvitationByStatus(
            @Valid @RequestBody LabDetailsRequest request) {
        return ResponseEntity.ok(doctorInvitationService.getAcceptedInvitationByStatus(request));
    }

    @PostMapping("/count")
    @Operation(summary = "Get the invitation counts of all roles")
    public DoctorInvitationCountDetails getInvitationCountOfAllRoles(
            @Valid @RequestBody DoctorInvitationCountRequest request) {
        return doctorInvitationService.getInvitationCountOfAllRoles(request);
    }

    @PostMapping("/accept")
    @Operation(summary = "Accept the organization connection request")
    public DoctorDetails acceptInvitation(@Valid @RequestBody DoctorInvitationAcceptRequest request) {
        DoctorDetails doctorDetails = doctorInvitationService.acceptInvitation(request);

        try {
            doctorInvitationService.processProfilesForDoctor(doctorDetails, request);
        } catch (Exception e) {
            log.error("Error while processing profiles for doctor with ID: {}", doctorDetails.getDoctorId(), e);
        }

        return doctorDetails;
    }

    @PostMapping("/accept/without-profile")
    @Operation(summary = "Accept the organization connection request by customer")
    public DoctorDetails acceptInvitationWithoutCreatingProfile(
            @Valid @RequestBody DoctorInvitationAcceptRequest request) {
        DoctorDetails doctorDetails = doctorInvitationService.acceptInvitationWithoutProfile(request);
        if (doctorDetails != null
                && doctorDetails.getProfiles() != null
                && !doctorDetails.getProfiles().isEmpty()) {

            for (var profile : doctorDetails.getProfiles()) {
                customerAccessAndRevokeService.saveAccessAndRevokeDetails(
                        profile.getProfileId(), request.getInvitationCode());
            }
        }

        return doctorDetails;
    }

    @PostMapping("/deactivate")
    @Operation(summary = "Deactivate invitation request")
    public void deactivateInvitation(@Valid @RequestBody DoctorInvitationDeactivateRequest request) {
        doctorInvitationService.deactivateInvitation(request);
    }

    @PostMapping("/reject")
    @Operation(summary = "Reject invitation request")
    public void rejectInvitation(@Valid @RequestBody DoctorInvitationDeactivateRequest request) {
        doctorInvitationService.rejectInvitation(request);
    }

    @PostMapping("/counts-by-roles")
    public ResponseEntity<InvitationRoleCountsWrapper> getDetailedInvitationCountsByRoles(
            @Valid @RequestBody InvitationCountRequest request) {

        var doctorId = request.getDoctorId();
        var organizationId = request.getOrganizationId();
        var profileId = request.getProfileId();

        InvitationRoleCountsWrapper counts =
                doctorInvitationService.getInvitationCountsByRoles(doctorId, organizationId, profileId);

        return ResponseEntity.ok(counts);
    }
}
