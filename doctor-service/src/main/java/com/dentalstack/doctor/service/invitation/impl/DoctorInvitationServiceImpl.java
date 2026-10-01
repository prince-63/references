package com.dentalstack.doctor.service.invitation.impl;

import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.invitation.*;
import com.dentalstack.doctor.entity.invitation.DoctorInvitation;
import com.dentalstack.doctor.service.invitation.DoctorInvitationService;
import com.dentalstack.doctor.service.invitation.InvitationAcceptService;
import com.dentalstack.doctor.service.invitation.InvitationCreationService;
import com.dentalstack.doctor.service.invitation.InvitationQueryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Facade service that delegates to focused sub-services.
 * Maintains backward compatibility with existing controllers and callers.
 *
 * @see InvitationCreationService for invitation creation and updates
 * @see InvitationAcceptService for invitation acceptance and profile creation
 * @see InvitationQueryService for querying, counting, deactivation and reminders
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorInvitationServiceImpl implements DoctorInvitationService {

    private final InvitationCreationService invitationCreationService;
    private final InvitationAcceptService invitationAcceptService;
    private final InvitationQueryService invitationQueryService;

    // ── Creation & Update (delegated to InvitationCreationService) ──

    @Override
    @Transactional
    public DoctorInvitation inviteDoctor(DoctorInvitationRequest request, String xOrgName) {
        return invitationCreationService.inviteDoctor(request, xOrgName);
    }

    // ── Acceptance (delegated to InvitationAcceptService) ──

    @Override
    @Transactional
    public DoctorDetails acceptInvitation(DoctorInvitationAcceptRequest request) {
        return invitationAcceptService.acceptInvitation(request);
    }

    @Override
    @Transactional
    public DoctorDetails acceptInvitationWithoutProfile(DoctorInvitationAcceptRequest request) {
        return invitationAcceptService.acceptInvitationWithoutProfile(request);
    }

    @Override
    public void processProfilesForDoctor(DoctorDetails doctorDetails, DoctorInvitationAcceptRequest request) {
        invitationAcceptService.processProfilesForDoctor(doctorDetails, request);
    }

    // ── Query & Management (delegated to InvitationQueryService) ──

    @Override
    public DoctorInvitation getDoctorInvitationDetails(String email, long organizationId, long inviterDoctorId) {
        return invitationQueryService.getDoctorInvitationDetails(email, organizationId, inviterDoctorId);
    }

    @Override
    @Transactional
    public DoctorInvitationDetailsWithPagination getActiveOrPendingInvitations(
            DoctorInvitationActiveOrPendingRequest request) {
        return invitationQueryService.getActiveOrPendingInvitations(request);
    }

    @Override
    public DoctorInvitationDetails getDoctorInvitationDetailsByInviteCode(String inviteCode, String xOrgName) {
        return invitationQueryService.getDoctorInvitationDetailsByInviteCode(inviteCode, xOrgName);
    }

    @Override
    public DoctorInvitationCountDetails getInvitationCountOfAllRoles(DoctorInvitationCountRequest request) {
        return invitationQueryService.getInvitationCountOfAllRoles(request);
    }

    @Override
    public void deactivateInvitation(DoctorInvitationDeactivateRequest request) {
        invitationQueryService.deactivateInvitation(request);
    }

    @Override
    public void rejectInvitation(DoctorInvitationDeactivateRequest request) {
        invitationQueryService.rejectInvitation(request);
    }

    @Override
    @Transactional
    public List<LabDetails> getAcceptedInvitationByStatus(LabDetailsRequest request) {
        return invitationQueryService.getAcceptedInvitationByStatus(request);
    }

    @Override
    @Transactional(readOnly = true)
    public InvitationRoleCountsWrapper getInvitationCountsByRoles(Long doctorId, Long organizationId, Long profileId) {
        return invitationQueryService.getInvitationCountsByRoles(doctorId, organizationId, profileId);
    }
}
