package com.dentalstack.doctor.service.invitation;

import com.dentalstack.doctor.client.PatientServiceClient;
import com.dentalstack.doctor.dto.CreateCardDisplayConfigRequestDto;
import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.event.PracticeConnectedEventMetadata;
import com.dentalstack.doctor.dto.invitation.DoctorInvitationAcceptRequest;
import com.dentalstack.doctor.dto.mail.doctorinvitation.VspCustomerSignedUpEmailRequest;
import com.dentalstack.doctor.dto.mail.welcome.WelcomeEmailRequest;
import com.dentalstack.doctor.dto.notification.SendNotificationRequest;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.invitation.DoctorInvitation;
import com.dentalstack.doctor.entity.invitation.DoctorInvitationCode;
import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.entity.rbac.SubRole;
import com.dentalstack.doctor.entity.user.Role;
import com.dentalstack.doctor.entity.user.User;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.OrgName;
import com.dentalstack.doctor.enums.UserType;
import com.dentalstack.doctor.enums.doctor.DoctorRole;
import com.dentalstack.doctor.enums.event.EventType;
import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.enums.invitation.UserRegistrationType;
import com.dentalstack.doctor.enums.organization.ProfileStatus;
import com.dentalstack.doctor.enums.organization.ProfileType;
import com.dentalstack.doctor.enums.user.CountryCode;
import com.dentalstack.doctor.enums.user.UserStatus;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.exception.invitation.DoctorInvitationNotFoundException;
import com.dentalstack.doctor.exception.invitation.InvalidInvitationException;
import com.dentalstack.doctor.mapper.DoctorMapper;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.repository.ServiceConfigurationRepository;
import com.dentalstack.doctor.repository.invitation.DoctorInvitationCodeRepository;
import com.dentalstack.doctor.repository.invitation.DoctorInvitationRepository;
import com.dentalstack.doctor.repository.rbac.SubRoleRepository;
import com.dentalstack.doctor.repository.user.OrganizationRepository;
import com.dentalstack.doctor.repository.user.RoleRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.ChatService;
import com.dentalstack.doctor.service.CustomerAccessAndRevokeService;
import com.dentalstack.doctor.service.PatientService;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles invitation acceptance and doctor profile creation workflows.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class InvitationAcceptService {

    private final DoctorRepository doctorRepository;
    private final DoctorInvitationRepository doctorInvitationRepository;
    private final DoctorInvitationCodeRepository doctorInvitationCodeRepository;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final SubRoleRepository subRoleRepository;
    private final ChatService chatService;
    private final PatientService patientService;
    private final PatientServiceClient patientServiceClient;
    private final CustomerAccessAndRevokeService customerAccessAndRevokeService;
    private final ServiceConfigurationRepository serviceConfigurationRepository;

    @Transactional
    public DoctorDetails acceptInvitation(DoctorInvitationAcceptRequest request) {

        DoctorInvitationCode doctorInvitationCode = doctorInvitationCodeRepository
                .findByCodeIgnoreCase(request.getInvitationCode().trim())
                .orElseThrow(() -> new DoctorInvitationNotFoundException(request.getInvitationCode()));

        var invitation = doctorInvitationRepository
                .findById(doctorInvitationCode.getDoctorInvitation().getId())
                .orElseThrow();
        Long subRoleId = null;
        if (invitation.getAssignedSubRole() != null) {
            subRoleId = invitation.getAssignedSubRole().getId();
        }
        var subRole = subRoleRepository.findByIdWithPermissions(subRoleId);

        InvitationValidator.validateNotExpired(invitation);

        if (!invitation.getEmail().equalsIgnoreCase(request.getEmail())) {
            throw new InvalidInvitationException("Email does not match the invitation");
        }
        Doctor doctor = createOrUpdateDoctor(invitation, request);

        createDoctorProfile(request, invitation, doctor, subRole.orElse(null));

        var orgProfile = userProfileRepository
                .findUserProfileByDoctorIdAndOrganizationIdWithDetails(
                        invitation.getInviter().getId(),
                        invitation.getOrganization().getId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        DoctorRole doctorRole =
                switch (invitation.getRoles()) {
                    case CONSULTING_ORTHODONTIST -> DoctorRole.PRACTICE;
                    case CUSTOMER -> DoctorRole.LAB_STAFF;
                    case VENDOR -> DoctorRole.VENDOR;
                    default -> null;
                };

        if (doctorRole != null) {
            chatService.sendWelcomeMailToUser(WelcomeEmailRequest.builder()
                    .doctorFirstName(doctor.getDoctorFirstNameWithSalutation())
                    .doctorEmail(request.getEmail())
                    .orgName(orgProfile.getOrganizationBrandName())
                    .companyName(orgProfile.getOrgName())
                    .doctorRole(doctorRole)
                    .build());

            if (serviceConfigurationRepository.isVspPlanningUser(doctorInvitationCode
                    .getDoctorInvitation()
                    .getInviterUserProfile()
                    .getId())) {
                String receiverUserName = (request.getSalutation() != null
                                && !request.getSalutation().isEmpty())
                        ? request.getSalutation() + ". " + request.getFirstName()
                        : request.getFirstName();
                chatService.sendVspCustomerSignedUpEmail(VspCustomerSignedUpEmailRequest.builder()
                        .orgName(OrgName.ROUTETOSMILEVSP.name())
                        .customerEmail(request.getEmail())
                        .customerName(receiverUserName)
                        .signupDate(LocalDate.now().toString())
                        .email(doctorInvitationCode
                                .getDoctorInvitation()
                                .getInviter()
                                .getEmail())
                        .build());
            }
        }
        patientService.addEventWithoutPatient(
                null,
                UserType.PATIENT,
                orgProfile.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.PRACTICE_CONNECTED_ORG,
                new PracticeConnectedEventMetadata(
                        fullName(request.getSalutation(), request.getFirstName(), request.getLastName()),
                        invitation.getRoles().name()),
                orgProfile.getId());

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Connected!")
                .message(String.format(
                        "%s has accepted your invitation. You are now connected.",
                        fullName(request.getSalutation(), request.getFirstName(), request.getLastName())))
                .mobile(orgProfile.getUser().getMobileNo())
                .notificationIndex(126)
                .email(orgProfile.getUser().getEmail())
                .isDoctorApp(true)
                .build());

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(ZonedDateTime.now());
        invitation.setInvitedDoctor(doctor);
        doctorInvitationRepository.save(invitation);

        return DoctorDetails.doctorDetails(
                doctor,
                invitation.getInviter().getId(),
                invitation.getInviterUserProfile().getId());
    }

    @Transactional
    public DoctorDetails acceptInvitationWithoutProfile(DoctorInvitationAcceptRequest request) {

        DoctorInvitationCode doctorInvitationCode = doctorInvitationCodeRepository
                .findByCodeIgnoreCase(request.getInvitationCode().trim())
                .orElseThrow(() -> new DoctorInvitationNotFoundException(request.getInvitationCode()));

        var invitation = doctorInvitationCode.getDoctorInvitation();

        InvitationValidator.validateNotExpired(invitation);
        if (invitation.getInvitedDoctor() == null) {
            throw new DoctorNotFoundException(request.getDoctorId());
        }

        var orgProfile = userProfileRepository
                .findUserProfileByDoctorIdAndOrganizationId(
                        invitation.getInviter().getId(),
                        invitation.getOrganization().getId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        var invitedDoctorProfile = userProfileRepository.findByIdWithOrgAndDoctorAndUser(request.getProfileId());

        if (invitedDoctorProfile.isPresent()) {
            patientService.addEventWithoutPatient(
                    null,
                    UserType.PATIENT,
                    orgProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.PRACTICE_CONNECTED_ORG,
                    new PracticeConnectedEventMetadata(
                            invitedDoctorProfile.get().getOrgName(),
                            invitation.getRoles().name()),
                    orgProfile.getId());

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title("Connected!")
                    .message(String.format(
                            "%s has accepted your invitation. You are now connected.",
                            invitedDoctorProfile.get().getOrgName()))
                    .mobile(orgProfile.getUser().getMobileNo())
                    .notificationIndex(126)
                    .email(orgProfile.getUser().getEmail())
                    .isDoctorApp(true)
                    .build());
            if (serviceConfigurationRepository.isVspPlanningUser(doctorInvitationCode
                    .getDoctorInvitation()
                    .getInviterUserProfile()
                    .getId())) {
                String receiverUserName = (request.getSalutation() != null
                                && !request.getSalutation().isEmpty())
                        ? request.getSalutation() + ". " + request.getFirstName()
                        : request.getFirstName();
                chatService.sendVspCustomerSignedUpEmail(VspCustomerSignedUpEmailRequest.builder()
                        .orgName(OrgName.ROUTETOSMILEVSP.name())
                        .customerEmail(request.getEmail())
                        .customerName(receiverUserName)
                        .signupDate(LocalDate.now().toString())
                        .email(doctorInvitationCode
                                .getDoctorInvitation()
                                .getInviter()
                                .getEmail())
                        .build());
            }
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(ZonedDateTime.now());
        invitation.setInvitedDoctor(invitation.getInvitedDoctor());
        doctorInvitationRepository.save(invitation);

        return DoctorDetails.doctorDetails(
                invitation.getInvitedDoctor(),
                invitation.getInviter().getId(),
                invitation.getInviterUserProfile().getId());
    }

    public void processProfilesForDoctor(DoctorDetails doctorDetails, DoctorInvitationAcceptRequest request) {
        if (doctorDetails == null
                || doctorDetails.getProfiles() == null
                || doctorDetails.getProfiles().isEmpty()) {
            return;
        }

        for (var profile : doctorDetails.getProfiles()) {
            handleProfile(profile, request);
        }
    }

    private void handleProfile(DoctorDetails.ProfileDetails profile, DoctorInvitationAcceptRequest request) {
        Long profileId = profile.getProfileId();
        String invitationCode = request.getInvitationCode();
        createCardDisplayConfigSafe(profileId, invitationCode);
    }

    private void createCardDisplayConfigSafe(Long profileId, String invitationCode) {
        try {
            patientServiceClient.createCardDisplayConfig(
                    new CreateCardDisplayConfigRequestDto(profileId, invitationCode));
            customerAccessAndRevokeService.saveAccessAndRevokeDetails(profileId, invitationCode);
        } catch (Exception e) {
            log.error("Failed to create card display config for profileId: " + profileId, e);
        }
    }

    // ── Internal helpers ──

    private Doctor createOrUpdateDoctor(DoctorInvitation invitation, DoctorInvitationAcceptRequest request) {
        Doctor doctor;
        if (invitation.getInvitedDoctor() != null) {
            doctor = invitation.getInvitedDoctor();
        } else {
            doctor = DoctorMapper.fromInvitationAcceptRequest(request);
        }
        return doctorRepository.save(doctor);
    }

    private void createDoctorProfile(
            DoctorInvitationAcceptRequest request, DoctorInvitation doctorInvitation, Doctor doctor, SubRole subRole) {

        Set<Organization> organizations = doctorInvitation.getOrganization() != null
                ? new HashSet<>(Set.of(doctorInvitation.getOrganization()))
                : new HashSet<>();
        doctor.setOrganizations(organizations);
        Role doctorRole = roleRepository
                .findByName(doctorInvitation.getRoles().name())
                .orElseThrow(() -> new RuntimeException(
                        "Role not found: " + doctorInvitation.getRoles().name()));

        Set<Role> doctorRoles = new HashSet<>();
        doctorRoles.add(doctorRole);

        User user = User.builder()
                .userType(UserType.DOCTOR)
                .mobileNo(request.getMobileNo())
                .email(request.getEmail())
                .status(UserStatus.ACTIVE)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .salutation(request.getSalutation())
                .UUID(DoctorMapper.generateUUID(UserType.DOCTOR))
                .countryCode(CountryCode.fromCode(request.getCountryCode()))
                .displayName(doctor.getSalutation() + "." + doctor.getFirstName()
                        + (doctor.getLastName() != null ? " " + doctor.getLastName() : ""))
                .xOrganizationName(request.getXOrgName())
                .organizationId(request.getOrganizationId())
                .build();

        UserProfile userProfile = UserProfile.builder()
                .user(user)
                .doctor(doctor)
                .organization(doctorInvitation.getOrganization())
                .profileType(ProfileType.INVITED)
                .status(ProfileStatus.ACTIVE)
                .roles(doctorRoles)
                .inviterProfile(doctorInvitation.getInviterUserProfile())
                .plan(subRole != null ? subRole.getPlan() : null)
                .subRole(subRole)
                .organizationBrandName(request.getBrand())
                .isTrackingEnabled(true)
                .isStlFileViewEnabled(false)
                .build();

        user.setUserProfile(userProfile);

        if (request.getRegistrationType() == UserRegistrationType.NEW_USER_INVITED) {
            doctor.setPrimaryUserProfile(userProfile);
        }
        if (doctor.getUserProfiles() == null) {
            doctor.setUserProfiles(new HashSet<>());
        }
        doctor.getUserProfiles().add(userProfile);

        userProfileRepository.save(userProfile);
        doctorRepository.save(doctor);
        organizationRepository.save(doctorInvitation.getOrganization());
    }

    String fullName(String salutation, String firstName, String lastName) {
        StringBuilder fullName = new StringBuilder();

        if (salutation != null && !salutation.isEmpty()) {
            fullName.append(salutation).append(" ");
        }

        if (firstName != null && !firstName.isEmpty()) {
            fullName.append(firstName).append(" ");
        }

        if (lastName != null && !lastName.isEmpty()) {
            fullName.append(lastName);
        }

        return fullName.toString().trim();
    }
}
