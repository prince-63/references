package com.dentalstack.doctor.service.invitation;

import com.dentalstack.doctor.client.AuthServiceClient;
import com.dentalstack.doctor.dto.event.DoctorInvitationReceivedEventMetadata;
import com.dentalstack.doctor.dto.invitation.DoctorInvitationRequest;
import com.dentalstack.doctor.dto.mail.doctorinvitation.DoctorInvitationEmailRequest;
import com.dentalstack.doctor.dto.mail.doctorinvitation.VspCustomerInvitationEmailRequest;
import com.dentalstack.doctor.dto.notification.SendNotificationRequest;
import com.dentalstack.doctor.dto.whatsapp.request.WhatsAppRequestBuilder;
import com.dentalstack.doctor.entity.invitation.DoctorInvitation;
import com.dentalstack.doctor.entity.invitation.DoctorInvitationCode;
import com.dentalstack.doctor.entity.rbac.SubRole;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.OrgName;
import com.dentalstack.doctor.enums.UserType;
import com.dentalstack.doctor.enums.doctor.DoctorRole;
import com.dentalstack.doctor.enums.event.EventType;
import com.dentalstack.doctor.enums.invitation.InvitationRole;
import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.enums.invitation.UserRegistrationType;
import com.dentalstack.doctor.enums.template.WhatsAppCampaignTemplate;
import com.dentalstack.doctor.exception.BusinessErrorCode;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.exception.invitation.InvitationAlreadyExistsForEmailException;
import com.dentalstack.doctor.exception.invitation.InvitationException;
import com.dentalstack.doctor.exception.organization.DifferentOrgException;
import com.dentalstack.doctor.mapper.DoctorInvitationMapper;
import com.dentalstack.doctor.mapper.UserProfileMapper;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.repository.ServiceConfigurationRepository;
import com.dentalstack.doctor.repository.invitation.DoctorInvitationRepository;
import com.dentalstack.doctor.repository.patient.PatientRepository;
import com.dentalstack.doctor.repository.rbac.SubRoleRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.ChatService;
import com.dentalstack.doctor.service.PatientService;
import com.dentalstack.doctor.utils.VspWebUrlResolver;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles invitation creation and update workflows.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class InvitationCreationService {

    private final DoctorRepository doctorRepository;
    private final DoctorInvitationRepository doctorInvitationRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientRepository patientRepository;
    private final SubRoleRepository subRoleRepository;
    private final AuthServiceClient authServiceClient;
    private final ChatService chatService;
    private final PatientService patientService;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final ServiceConfigurationRepository serviceConfigurationRepository;

    @Transactional
    public DoctorInvitation inviteDoctor(DoctorInvitationRequest request, String xOrgName) {
        return Optional.ofNullable(request.getInvitationId())
                .map(id -> updateInvitation(request, xOrgName))
                .orElseGet(() -> createNewInvitation(request, xOrgName));
    }

    private DoctorInvitation createNewInvitation(DoctorInvitationRequest request, String xOrgName) {
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            request.setProfileId(userProfile.getId());
            request.setDoctorId(userProfile.getDoctor().getId());
            request.setOrganizationId(userProfile.getOrganization().getId());
        }

        InvitationRole inviterRole = null;
        if (!userProfile.getRoles().isEmpty()) {
            inviterRole = InvitationRole.valueOf(
                    userProfile.getRoles().stream().findFirst().get().getName());
        }

        checkPatientWithEmailAndMobile(request, xOrgName);
        validateNoExistingInvitationWithEmail(request, userProfile.getDoctor().getId(), xOrgName);

        var existingDoctor =
                doctorRepository.findByEmailWithAllDetails(request.getEmail(), request.getOrganizationId(), xOrgName);
        if (existingDoctor.isPresent()) {
            var userProfiles = existingDoctor.get().getUserProfiles();

            var latestUserProfile = userProfiles.stream()
                    .max(Comparator.comparing(UserProfile::getCreatedAt))
                    .orElse(null);

            if (latestUserProfile != null) {
                if (!latestUserProfile
                        .getOrganizationBrandName()
                        .equalsIgnoreCase(userProfile.getOrganizationBrandName())) {
                    throw new DifferentOrgException();
                }
                if (latestUserProfile.isEnterprise()) {
                    request.setDoctorRole(DoctorRole.ENTERPRISE_CUSTOMER);
                } else if (latestUserProfile.isInHouseManufacturingLab()) {
                    request.setDoctorRole(DoctorRole.GROWTH_CUSTOMER);
                } else if (latestUserProfile.isPractice()) {
                    request.setDoctorRole(DoctorRole.PRACTICE_CUSTOMER);
                }
            }
        }

        InvitationRole mappedRole = mapUserRoleToInvitationRole(request.getDoctorRole());
        var invitationRoles = mappedRole != null ? List.of(mappedRole) : List.<InvitationRole>of();

        SubRole subRole = getSubRoleForDoctorRole(
                request.getDoctorRole(), userProfile.getPlan().getId());

        var invitation = DoctorInvitationMapper.fromRequest(
                request, userProfile, existingDoctor.orElse(null), invitationRoles, inviterRole, xOrgName);
        invitation.setAssignedSubRole(subRole);

        var invitationCode = createInvitationCode(invitation, generateUniqueInvitationCode());

        if (request.getIsInvitationSend() != null && request.getIsInvitationSend()) {
            sendInvitationEmail(invitationCode.getCode(), request, invitation, userProfile);
            invitation.setLastInvitationAt(ZonedDateTime.now());
        }
        return Optional.of(doctorInvitationRepository.save(invitation)).orElseThrow();
    }

    private DoctorInvitation updateInvitation(DoctorInvitationRequest request, String xOrgName) {

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            request.setProfileId(userProfile.getId());
            request.setDoctorId(userProfile.getDoctor().getId());
            request.setOrganizationId(userProfile.getOrganization().getId());
        }
        assert request.getInvitationId() != null;
        var invitation = doctorInvitationRepository
                .findByIdWithInviterAndOrganizationAndInvitedDoctor(request.getInvitationId())
                .orElseThrow(() -> new com.dentalstack.doctor.exception.invitation.DoctorInvitationNotFoundException(
                        request.getInvitationId()));

        var existingDoctor =
                doctorRepository.findByEmailWithAllDetails(request.getEmail(), request.getOrganizationId(), xOrgName);
        if (existingDoctor.isPresent()) {
            var userProfiles = existingDoctor.get().getUserProfiles();

            var latestUserProfile = userProfiles.stream()
                    .max(Comparator.comparing(UserProfile::getCreatedAt))
                    .orElse(null);
            if (latestUserProfile != null) {
                if (latestUserProfile.isEnterprise()) {
                    request.setDoctorRole(DoctorRole.ENTERPRISE_CUSTOMER);
                } else if (latestUserProfile.isInHouseManufacturingLab()) {
                    request.setDoctorRole(DoctorRole.GROWTH_CUSTOMER);
                }
            }
        }
        var invitationRoles = List.of(mapUserRoleToInvitationRole(request.getDoctorRole()));

        if (request.getInvitedUserProfileId() != null) {
            Long invitedUserProfileId = request.getInvitedUserProfileId();
            if (invitedUserProfileId <= 0) {
                throw new InvitationException(
                        "Invalid invited user profile id", BusinessErrorCode.BAD_INVITATION_REQUEST);
            }

            var invitedUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(invitedUserProfileId)
                    .orElseThrow(() -> new InvitationException(
                            String.format("Invited user profile not found with id %d", invitedUserProfileId),
                            BusinessErrorCode.BAD_INVITATION_REQUEST));

            if (invitedUserProfile.getOrganization() == null
                    || userProfile.getOrganization() == null
                    || !invitedUserProfile
                            .getOrganization()
                            .getId()
                            .equals(userProfile.getOrganization().getId())) {
                throw new InvitationException(
                        "Invited user profile does not belong to inviter organization",
                        BusinessErrorCode.BAD_INVITATION_REQUEST);
            }

            UserProfileMapper.updateFromInvitationRequest(invitedUserProfile, request);
            userProfileRepository.save(invitedUserProfile);
        }
        DoctorInvitationMapper.updateFromRequest(invitation, request, invitationRoles);

        if (request.getIsInvitationSend() != null && request.getIsInvitationSend()) {
            InvitationValidator.refreshIfExpired(invitation);

            sendInvitationEmail(invitation.getDoctorInvitationCode().getCode(), request, invitation, userProfile);
            invitation.setLastInvitationAt(ZonedDateTime.now());
            invitation.setStatus(InvitationStatus.PENDING);
        }
        return doctorInvitationRepository.save(invitation);
    }

    private void checkPatientWithEmailAndMobile(DoctorInvitationRequest request, String xOrgName) {
        if (request.getEmail() != null) {
            var checkWithEmail = authServiceClient.checkWithEmailAndOrgIdAndXOrgName(
                    request.getEmail(), request.getOrganizationId(), xOrgName);
            if (checkWithEmail) {
                throw InvitationException.with(request.getEmail(), null);
            }
        }
    }

    private void validateNoExistingInvitationWithEmail(
            DoctorInvitationRequest request, Long inviterId, String xOrgName) {
        if (request.getEmail() != null
                && doctorInvitationRepository.existsByOrganizationIdAndInviterIdAndStatusNotAndExpiresAtAfterAndEmail(
                        request.getOrganizationId(),
                        inviterId,
                        InvitationStatus.EXPIRED,
                        request.getEmail(),
                        xOrgName)) {
            throw new InvitationAlreadyExistsForEmailException(request.getEmail());
        }
    }

    SubRole getSubRoleForDoctorRole(DoctorRole doctorRole, Long planId) {
        String subRoleName;
        String planName = null;

        switch (doctorRole) {
            case CONSULTING_ORTHODONTIST:
                subRoleName = "Customer (With Tracking)";
                break;
            case VENDOR:
                subRoleName = "LABS";
                break;
            case CUSTOMER:
                subRoleName = "CUSTOMER";
                break;
            case LAB_STAFF:
                subRoleName = "LAB_STAFF";
                break;
            case ENTERPRISE_CUSTOMER:
                subRoleName = "SUPER_ADMIN";
                planName = "ENTERPRISE";
                break;
            case GROWTH_CUSTOMER:
                subRoleName = "SUPER_ADMIN";
                planName = "GROWTH_PLAN";
                break;
            default:
                return null;
        }

        if (planName != null) {
            return subRoleRepository
                    .findSubRoleByNameAndPlanName(subRoleName, planName)
                    .orElse(null);
        }

        return subRoleRepository
                .findSubRoleByNameAndPlanIdWithPlan(subRoleName, planId)
                .orElse(null);
    }

    InvitationRole mapUserRoleToInvitationRole(DoctorRole userRole) {
        return switch (userRole) {
            case CLINIC_OWNER -> InvitationRole.CLINIC_OWNER;
            case ALIGNER_COMPANY_OR_LAB -> InvitationRole.ALIGNER_COMPANY_OR_LAB;
            case CONSULTING_ORTHODONTIST -> InvitationRole.CONSULTING_ORTHODONTIST;
            case IN_OFFICE_MANUFACTURER -> InvitationRole.IN_OFFICE_MANUFACTURER;
            case COMMERCIAL_ALIGNER_LAB -> InvitationRole.COMMERCIAL_ALIGNER_LAB;
            case CUSTOMER -> InvitationRole.CUSTOMER;
            case LAB_STAFF -> InvitationRole.LAB_STAFF;
            case VENDOR -> InvitationRole.VENDOR;
            case ENTERPRISE_COMPANY_LAB -> InvitationRole.ENTERPRISE_COMPANY_LAB;
            case INTERNAL_USER -> InvitationRole.INTERNAL_USER;
            case ENTERPRISE_CUSTOMER -> InvitationRole.ENTERPRISE_CUSTOMER;
            case GROWTH_CUSTOMER -> InvitationRole.GROWTH_CUSTOMER;
            case PRACTICE_CUSTOMER -> InvitationRole.PRACTICE_CUSTOMER;
            case PRACTICE -> null;
        };
    }

    // ── Invitation code helpers ──

    private DoctorInvitationCode createInvitationCode(DoctorInvitation invitation, String invitationCode) {
        DoctorInvitationCode doctorInvitationCode = DoctorInvitationCode.builder()
                .code(invitationCode)
                .doctorInvitation(invitation)
                .build();

        invitation.setDoctorInvitationCode(doctorInvitationCode);

        return doctorInvitationCode;
    }

    private String generateUniqueInvitationCode() {
        return UUID.randomUUID().toString();
    }

    // ── Email / notification sending ──

    private void sendInvitationEmail(
            String invitationCode,
            DoctorInvitationRequest request,
            DoctorInvitation doctorInvitation,
            UserProfile userProfile) {
        var orgName = userProfile.getOrgName();
        try {

            if (doctorInvitation.getInvitedDoctor() != null
                    && !request.getDoctorRole().equals(DoctorRole.CONSULTING_ORTHODONTIST)) {
                var invitedDoctorProfile = userProfileRepository.findTopByDoctorIdAndRoleNameOrderByCreatedAtDesc(
                        doctorInvitation.getInvitedDoctor().getId(), String.valueOf(doctorInvitation.getRoles()));
                invitedDoctorProfile.ifPresent(profile -> patientService.addEventWithoutPatient(
                        null,
                        UserType.PATIENT,
                        doctorInvitation.getInvitedDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.DOCTOR_INVITATION_RECEIVED,
                        new DoctorInvitationReceivedEventMetadata(
                                profile.getPracticeName(), orgName, String.valueOf(request.getDoctorRole())),
                        profile.getId()));
            }

            String receiverUserName =
                    (request.getSalutation() != null && !request.getSalutation().isEmpty())
                            ? request.getSalutation() + ". " + request.getFirstName()
                            : request.getFirstName();

            Boolean isEnabled = userProfileRepository.isWhatsAppEnabled(request.getProfileId());
            if (serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
                VspCustomerInvitationEmailRequest emailRequest = VspCustomerInvitationEmailRequest.builder()
                        .portalUrl(VspWebUrlResolver.getCustomerInvitationUrl(invitationCode))
                        .customerName(receiverUserName)
                        .orgName(OrgName.ROUTETOSMILEVSP.name())
                        .email(request.getEmail())
                        .mobileNo(request.getMobileNo())
                        .invitationCode(invitationCode)
                        .whatsappEnabled(isEnabled)
                        .build();
                chatService.sendVspCustomerInvitationEmail(emailRequest);
            } else {
                chatService.inviteToAllUsersExceptPractice(DoctorInvitationEmailRequest.builder()
                        .inviteCode(invitationCode)
                        .email(request.getEmail())
                        .senderCompanyName(orgName)
                        .receiverUserName(receiverUserName)
                        .doctorRole(request.getDoctorRole())
                        .registrationType(doctorInvitation.getRegistrationType())
                        .senderEmail(userProfile.getUser().getEmail())
                        .orgName(userProfile.getOrganizationBrandName())
                        .build());
            }

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title("New invitation")
                    .message(String.format("%s has sent you an invitation to connect.", userProfile.getOrgName()))
                    .mobile(request.getMobileNo())
                    .notificationIndex(128)
                    .email(request.getEmail())
                    .isDoctorApp(true)
                    .doctorRole(String.valueOf(request.getDoctorRole()))
                    .build());

            if (request.getDoctorRole().equals(DoctorRole.CONSULTING_ORTHODONTIST)) {
                String code = doctorInvitation.getDoctorInvitationCode().getCode();
                String urlPath = String.format("$s/connect", code);
                whatsAppRequestBuilder.buildRequestIfMobileExists(
                        request.getMobileNo(),
                        WhatsAppCampaignTemplate.BUSINESS_INVITE.name(),
                        List.of(request.getFirstName(), urlPath));
            } else if (request.getDoctorRole().equals(DoctorRole.VENDOR)) {
                if (doctorInvitation.getRegistrationType().equals(UserRegistrationType.NEW_USER_INVITED)) {
                    String code = doctorInvitation.getDoctorInvitationCode().getCode();
                    String urlPath = String.format("$s/connect", code);
                    whatsAppRequestBuilder.buildRequestIfMobileExists(
                            request.getMobileNo(),
                            WhatsAppCampaignTemplate.BUSINESS_INVITE.name(),
                            List.of(request.getFirstName(), urlPath));
                }
            } else if (request.getDoctorRole().equals(DoctorRole.CUSTOMER)) {
                if (doctorInvitation.getRegistrationType().equals(UserRegistrationType.NEW_USER_INVITED)) {
                    String code = doctorInvitation.getDoctorInvitationCode().getCode();
                    String urlPath = String.format("$s/connect", code);
                    whatsAppRequestBuilder.buildRequestIfMobileExists(
                            request.getMobileNo(),
                            WhatsAppCampaignTemplate.BUSINESS_INVITE.name(),
                            List.of(request.getFirstName(), urlPath));
                } else if (doctorInvitation.getRegistrationType().equals(UserRegistrationType.EXISTING_USER)) {
                    String urlPath = "customers";
                    whatsAppRequestBuilder.buildRequestIfMobileExists(
                            request.getMobileNo(),
                            WhatsAppCampaignTemplate.BUSINESS_INVITE.name(),
                            List.of(request.getFirstName(), urlPath));
                }
            } else if (request.getDoctorRole().equals(DoctorRole.LAB_STAFF)) {
                String code = doctorInvitation.getDoctorInvitationCode().getCode();
                String urlPath = String.format("$s/connect", code);
                whatsAppRequestBuilder.buildRequestIfMobileExists(
                        request.getMobileNo(),
                        WhatsAppCampaignTemplate.BUSINESS_INVITE.name(),
                        List.of(request.getFirstName(), urlPath));
            }
        } catch (Exception ignored) {
        }
    }
}
