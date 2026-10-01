package com.dentalstack.doctor.service.invitation;

import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.invitation.*;
import com.dentalstack.doctor.entity.invitation.DoctorInvitation;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

public interface DoctorInvitationService {
    DoctorInvitation inviteDoctor(DoctorInvitationRequest request, String xOrgName);

    DoctorInvitation getDoctorInvitationDetails(String email, long organizationId, long inviterDoctorId);

    DoctorInvitationDetailsWithPagination getActiveOrPendingInvitations(DoctorInvitationActiveOrPendingRequest request);

    DoctorDetails acceptInvitation(DoctorInvitationAcceptRequest request);

    DoctorInvitationDetails getDoctorInvitationDetailsByInviteCode(String inviteCode, String xOrgName);

    DoctorInvitationCountDetails getInvitationCountOfAllRoles(DoctorInvitationCountRequest request);

    void deactivateInvitation(DoctorInvitationDeactivateRequest request);

    void rejectInvitation(DoctorInvitationDeactivateRequest request);

    DoctorDetails acceptInvitationWithoutProfile(DoctorInvitationAcceptRequest request);

    List<LabDetails> getAcceptedInvitationByStatus(LabDetailsRequest request);

    void processProfilesForDoctor(DoctorDetails doctorDetails, DoctorInvitationAcceptRequest request);

    @Transactional(readOnly = true)
    InvitationRoleCountsWrapper getInvitationCountsByRoles(Long doctorId, Long organizationId, Long profileId);
}
