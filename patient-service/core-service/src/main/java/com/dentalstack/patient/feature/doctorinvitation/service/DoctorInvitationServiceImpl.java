package com.dentalstack.patient.feature.doctorinvitation.service;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.DoctorRepository;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationEmailRequest;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationRequest;
import com.dentalstack.patient.feature.doctorinvitation.entity.DoctorInvitation;
import com.dentalstack.patient.feature.doctorinvitation.entity.DoctorInvitationCode;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationRole;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.doctorinvitation.exception.*;
import com.dentalstack.patient.feature.doctorinvitation.repository.DoctorInvitationRepository;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.rbac.dto.auditlog.CreateAuditRequest;
import com.dentalstack.patient.feature.rbac.entity.SubRole;
import com.dentalstack.patient.feature.rbac.enums.AuditAction;
import com.dentalstack.patient.feature.rbac.exception.AccessControlException;
import com.dentalstack.patient.feature.rbac.repository.SubRoleRepository;
import com.dentalstack.patient.feature.rbac.service.AuditLogService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorInvitationServiceImpl implements DoctorInvitationService {

    private final DoctorRepository doctorRepository;
    private final DoctorInvitationRepository doctorInvitationRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientRepository patientRepository;
    private final SubRoleRepository subRoleRepository;
    private final AuditLogService auditLogService;
    private final ChatService chatService;

    @Override
    @Transactional
    public DoctorInvitation inviteDoctor(DoctorInvitationRequest request, String xOrgName) {
        return Optional.ofNullable(request.getInvitationId())
                .map(id -> updateInvitation(request))
                .orElseGet(() -> createNewInvitation(request, xOrgName));
    }

    private DoctorInvitation createNewInvitation(DoctorInvitationRequest request, String xOrgName) {
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var inviterUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && inviterUserProfile.getInviterProfile() != null) {
            inviterUserProfile = inviterUserProfile.getInviterProfile();
            request.setOrganizationId(inviterUserProfile.getOrganization().getId());
            request.setDoctorId(inviterUserProfile.getDoctor().getId());
            request.setProfileId(inviterUserProfile.getId());
        }
        InvitationRole inviterRole = null;
        if (!inviterUserProfile.getRoles().isEmpty()) {
            inviterRole = InvitationRole.valueOf(
                    inviterUserProfile.getRoles().stream().findFirst().get().getName());
        }

        validateInvitationRequest(request, inviterUserProfile);
        var existingDoctor =
                doctorRepository.findByEmailWithAllDetails(request.getEmail(), request.getOrganizationId(), xOrgName);
        if (existingDoctor.isPresent()) {
            if (request.getDoctorRole() == null) {
                throw new InvitationAlreadyExistsForEmailException(request.getEmail());
            }
            var userProfiles = existingDoctor.get().getUserProfiles();

            var latestUserProfile = userProfiles.stream()
                    .max(Comparator.comparing(UserProfile::getCreatedAt))
                    .orElse(null);

            if (latestUserProfile != null) {
                if (!latestUserProfile
                        .getOrganizationBrandName()
                        .equalsIgnoreCase(inviterUserProfile.getOrganizationBrandName())) {
                    throw new DifferentOrgException();
                }
            }
        }

        var subRole = subRoleRepository.findById(request.getSubRoleId()).orElseThrow();
        var invitation = DoctorInvitation.createDoctorInvitation(
                request, inviterUserProfile, existingDoctor.orElse(null), subRole, inviterRole, xOrgName);

        var invitationCode = createInvitationCode(invitation, generateUniqueInvitationCode());
        createRoleAssignmentAuditLog(subRole, inviterUserProfile, inviterUserProfile);
        if (request.getIsInvitationSend() != null && request.getIsInvitationSend()) {
            sendInvitationEmail(invitationCode.getCode(), request, invitation, inviterUserProfile);
            invitation.setLastInvitationAt(ZonedDateTime.now());
        }

        return Optional.of(doctorInvitationRepository.save(invitation)).orElseThrow();
    }

    private void sendInvitationEmail(
            String invitationCode,
            DoctorInvitationRequest request,
            DoctorInvitation doctorInvitation,
            UserProfile userProfile) {
        var orgName = userProfile.getOrgName();
        chatService.inviteToAllUsersExceptPractice(DoctorInvitationEmailRequest.builder()
                .inviteCode(invitationCode)
                .email(request.getEmail())
                .senderCompanyName(orgName)
                .receiverUserName(request.getSalutation() + ". " + request.getFirstName())
                .registrationType(doctorInvitation.getRegistrationType())
                .senderEmail(userProfile.getUser().getEmail())
                .doctorRole(DoctorRole.INTERNAL_USER)
                .orgName(userProfile.getOrganizationBrandName())
                .build());
    }

    private void createRoleAssignmentAuditLog(SubRole subRole, UserProfile assignedBy, UserProfile assignedTo) {
        String actionDescription = "Assigned role to user";

        CreateAuditRequest auditRequest = CreateAuditRequest.builder()
                .subRoleId(subRole.getId())
                .assignedByProfileId(assignedBy.getId())
                .assignedToProfileId(assignedTo.getId())
                .action(AuditAction.ROLE_ASSIGNED)
                .changeDescription(actionDescription)
                .previousValue(null)
                .newValue(subRole.getName())
                .roleName(subRole.getName())
                .build();

        auditLogService.createAuditLog(auditRequest);
    }

    private DoctorInvitation updateInvitation(DoctorInvitationRequest request) {
        assert request.getInvitationId() != null;

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            request.setOrganizationId(userProfile.getOrganization().getId());
            request.setDoctorId(userProfile.getDoctor().getId());
            request.setProfileId(userProfile.getId());
        }

        if (request.getInvitedUserProfileId() != null) {
            var invitedUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(request.getInvitedUserProfileId())
                    .orElseThrow();
            UserProfile.updateDoctorAccount(invitedUserProfile, request);
            userProfileRepository.save(invitedUserProfile);
        }
        var invitation = doctorInvitationRepository
                .findByIdWithInviterAndOrganizationAndInvitedDoctor(request.getInvitationId())
                .orElseThrow(() -> new DoctorInvitationNotFoundException(request.getInvitationId()));

        if (InvitationStatus.DEACTIVATED.equals(request.getInvitationStatus())) {
            invitation.setStatus(InvitationStatus.DEACTIVATED);
            return doctorInvitationRepository.save(invitation);
        }
        hasEmailAndMobileChanged(invitation, request);

        var subRole = subRoleRepository
                .findById(request.getSubRoleId())
                .orElseThrow(() -> new AccessControlException("SubRole not found"));

        DoctorInvitation.updateDetails(invitation, request, subRole);

        if (InvitationStatus.ACCEPTED.equals(invitation.getStatus()) && invitation.getInvitedDoctor() != null) {
            updateUserProfileSubRole(invitation, subRole);
        }

        invitation.validateInvitationForResent();
        if (request.getIsInvitationSend() != null && request.getIsInvitationSend()) {
            invitation.validateInvitationForResent();

            sendInvitationEmail(invitation.getDoctorInvitationCode().getCode(), request, invitation, userProfile);
            invitation.setLastInvitationAt(ZonedDateTime.now());
            invitation.setStatus(InvitationStatus.PENDING);
        }
        return doctorInvitationRepository.save(invitation);
    }

    private void updateUserProfileSubRole(DoctorInvitation invitation, SubRole subRole) {
        assert invitation.getInvitedDoctor() != null;
        Long doctorId = invitation.getInvitedDoctor().getId();
        Long inviterProfileId = invitation.getInviterUserProfile().getId();

        var userProfile = userProfileRepository
                .findUserProfileByDoctorIdAndInviterProfileId(doctorId, inviterProfileId)
                .orElseGet(() -> {
                    var userProfiles = userProfileRepository.findUserProfilesByDoctorId(doctorId);
                    return userProfiles.isEmpty() ? null : userProfiles.get(0);
                });

        if (userProfile != null) {
            userProfile.setSubRole(subRole);
            userProfileRepository.save(userProfile);
        }
    }

    private String generateUniqueInvitationCode() {
        return java.util.UUID.randomUUID().toString();
    }

    private void validateInvitationRequest(DoctorInvitationRequest request, UserProfile inviterUserProfile) {
        checkPatientWithEmailAndMobile(request);
        validateInviter(inviterUserProfile, request);
        validateNoExistingInvitationWithMobile(
                request, inviterUserProfile.getDoctor().getId());
        validateNoExistingInvitationWithEmail(
                request, inviterUserProfile.getDoctor().getId());
    }

    private void checkPatientWithEmailAndMobile(DoctorInvitationRequest request) {
        if (request.getMobileNo() != null) {
            var optionalPatient = patientRepository.findByMobileNo(request.getMobileNo());
            if (optionalPatient.isPresent()) {
                throw InvitationException.with(null, request.getMobileNo());
            }
        }
        if (request.getEmail() != null) {

            var patientByEmail = patientRepository.findByEmail(request.getEmail());
            if (patientByEmail.isPresent()) {
                throw InvitationException.with(request.getEmail(), null);
            }
        }
    }

    private void validateInviter(UserProfile inviter, DoctorInvitationRequest request) {
        var user = inviter.getUser();
        if ((user.getEmail().equalsIgnoreCase(request.getEmail()))
                || inviter.getUser().getMobileNo() != null
                        && inviter.getUser().getMobileNo().equalsIgnoreCase(request.getMobileNo())) {
            throw new DoctorNotFoundException();
        }
    }

    private void validateNoExistingInvitationWithMobile(DoctorInvitationRequest request, Long inviterId) {
        if (request.getMobileNo() != null
                && doctorInvitationRepository
                        .existsByOrganizationIdAndInviterIdAndStatusNotAndExpiresAtAfterAndMobileNo(
                                request.getOrganizationId(),
                                inviterId,
                                InvitationStatus.EXPIRED,
                                request.getMobileNo())) {
            throw new InvitationAlreadyExistsForMobileException(request.getMobileNo());
        }
    }

    private void validateNoExistingInvitationWithEmail(DoctorInvitationRequest request, Long inviterId) {
        if (request.getEmail() != null
                && doctorInvitationRepository.existsByOrganizationIdAndInviterIdAndStatusNotAndExpiresAtAfterAndEmail(
                        request.getOrganizationId(), inviterId, InvitationStatus.EXPIRED, request.getEmail())) {
            throw new InvitationAlreadyExistsForEmailException(request.getEmail());
        }
    }

    private void hasEmailAndMobileChanged(DoctorInvitation invitation, DoctorInvitationRequest request) {
        if (hasEmailChanged(invitation, request)) {
            validateNoExistingInvitationWithEmail(
                    request, invitation.getInviter().getId());
        }
        if (hasMobileChanged(invitation, request)) {
            validateNoExistingInvitationWithMobile(
                    request, invitation.getInviter().getId());
        }
    }

    private boolean hasMobileChanged(DoctorInvitation invitation, DoctorInvitationRequest request) {
        return (request.getMobileNo() != null && !request.getMobileNo().equalsIgnoreCase(invitation.getMobileNo()));
    }

    private boolean hasEmailChanged(DoctorInvitation invitation, DoctorInvitationRequest request) {
        return !request.getEmail().equalsIgnoreCase(invitation.getEmail());
    }

    private DoctorInvitationCode createInvitationCode(DoctorInvitation invitation, String invitationCode) {
        DoctorInvitationCode doctorInvitationCode = DoctorInvitationCode.builder()
                .code(invitationCode)
                .doctorInvitation(invitation)
                .build();

        invitation.setDoctorInvitationCode(doctorInvitationCode);

        return doctorInvitationCode;
    }
}
