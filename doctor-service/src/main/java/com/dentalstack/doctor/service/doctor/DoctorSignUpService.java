package com.dentalstack.doctor.service.doctor;

import com.dentalstack.doctor.dto.chargebee.ChargebeeCreateCustomerRequest;
import com.dentalstack.doctor.dto.doctor.AddDoctorRequest;
import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.mail.welcome.WelcomeEmailRequest;
import com.dentalstack.doctor.dto.rbac.AddProfileRequest;
import com.dentalstack.doctor.dto.user.CreateUserProfile;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.entity.rbac.SubRole;
import com.dentalstack.doctor.entity.user.Role;
import com.dentalstack.doctor.entity.user.User;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.UserType;
import com.dentalstack.doctor.enums.doctor.DoctorRole;
import com.dentalstack.doctor.enums.organization.OrganizationType;
import com.dentalstack.doctor.enums.organization.ProfileStatus;
import com.dentalstack.doctor.enums.organization.ProfileType;
import com.dentalstack.doctor.enums.user.CountryCode;
import com.dentalstack.doctor.enums.user.UserStatus;
import com.dentalstack.doctor.exception.BusinessException;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.exception.doctor.ErrorCode;
import com.dentalstack.doctor.exception.doctor.InvalidRequestException;
import com.dentalstack.doctor.exception.organization.OrganizationAlreadyPresentException;
import com.dentalstack.doctor.mapper.DoctorMapper;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.repository.rbac.SubRoleRepository;
import com.dentalstack.doctor.repository.user.OrganizationRepository;
import com.dentalstack.doctor.repository.user.RoleRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.NotificationDispatcher;
import com.dentalstack.doctor.service.PatientService;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service responsible for doctor sign-up, profile creation, and onboarding flows.
 * Extracted from DoctorServiceImpl to follow Single Responsibility Principle.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorSignUpService {

    private final DoctorRepository doctorRepository;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final SubRoleRepository subRoleRepository;
    private final PatientService patientService;
    private final NotificationDispatcher notificationDispatcher;

    @Transactional(rollbackFor = {BusinessException.class})
    public DoctorDetails signUp(AddDoctorRequest req) {
        if (doctorRepository.existsByEmailAndOrganizationIdAndXOrgNameActiveTrue(
                req.getEmail(), req.getOrganizationId(), req.getXOrgName())) {
            throw new InvalidRequestException(
                    ErrorCode.BAD_REQUEST, "This email already exists. Kindly login or use another email");
        }

        var doctor = doctorRepository.save(DoctorMapper.fromAddRequest(req));

        if (doctor.getOrganizations() == null) {
            doctor.setOrganizations(new HashSet<>());
        }

        Optional<Organization> organization = organizationRepository.findById(req.getOrganizationId());
        Organization savedOrganization;
        if (organization.isEmpty()) {
            Organization newOrg = Organization.builder()
                    .name(req.getFirstName() + " " + req.getLastName() + "'s Clinic")
                    .type(OrganizationType.SELF_OWNED)
                    .active(true)
                    .build();

            savedOrganization = organizationRepository.save(newOrg);
            doctor.getOrganizations().add(savedOrganization);
        } else {
            Organization newOrg = organization.get();
            newOrg.setName(req.getFirstName() + " " + req.getLastName() + "'s Clinic");
            newOrg.setType(OrganizationType.SELF_OWNED);
            newOrg.setActive(true);
            savedOrganization = organizationRepository.save(newOrg);
            doctor.getOrganizations().add(savedOrganization);
        }

        doctorRepository.save(doctor);

        Set<Role> doctorRoles = req.getRoles().stream()
                .map(roleEnum -> roleRepository
                        .findByName(roleEnum.name())
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleEnum.name())))
                .collect(Collectors.toCollection(HashSet::new));

        List<String> selectedRoleNames = Optional.ofNullable(req.getSelectedRoles())
                .map(roles -> roles.stream()
                        .filter(Objects::nonNull)
                        .map(Enum::name)
                        .collect(Collectors.toCollection(ArrayList::new)))
                .orElse(new ArrayList<>());

        var user = User.builder()
                .userType(UserType.DOCTOR)
                .mobileNo(req.getMobile())
                .email(req.getEmail())
                .status(UserStatus.ACTIVE)
                .firstName((req.getFirstName()))
                .lastName(req.getLastName())
                .salutation(req.getSalutation())
                .UUID(DoctorMapper.generateUUID(UserType.DOCTOR))
                .countryCode(CountryCode.fromCode(req.getCountryCode()))
                .displayName(req.getSalutation() + ". "
                        + req.getFirstName()
                        + (req.getLastName() != null ? " " + req.getLastName() : ""))
                .organizationId(req.getOrganizationId())
                .xOrganizationName(req.getXOrgName())
                .build();

        var subRole = getSubrole(req.getRoles());

        UserProfile userProfile = UserProfile.builder()
                .user(user)
                .doctor(doctor)
                .organization(savedOrganization)
                .profileType(ProfileType.OWNER)
                .status(ProfileStatus.ACTIVE)
                .roles(doctorRoles)
                .subRole(subRole)
                .plan(subRole != null ? subRole.getPlan() : null)
                .organizationBrandName(req.getBrand() != null ? req.getBrand() : "Dental Stack")
                .isTrackingEnabled(true)
                .isStlFileViewEnabled(false)
                .selectedRoles(selectedRoleNames)
                .build();

        userProfileRepository.save(userProfile);

        if (doctor.getUserProfiles() == null) {
            doctor.setUserProfiles(new HashSet<>());
        }

        DoctorRole doctorRole = null;

        if (req.getSelectedRoles() != null && !req.getSelectedRoles().isEmpty()) {
            doctorRole = req.getSelectedRoles().get(0);
        }

        doctor.getUserProfiles().add(userProfile);
        doctor.setPrimaryUserProfile(userProfile);
        organizationRepository.save(savedOrganization);
        log.info("Attempting to save doctor with ID: {}", doctor.getId());

        try {
            doctor = doctorRepository.save(doctor);
            log.info("Doctor saved successfully with ID: {}", doctor.getId());
        } catch (Exception e) {
            log.error("Error saving doctor: ", e);
            throw e;
        }

        DoctorDetails details = DoctorDetails.doctorDetails(doctor);

        if (doctorRole != null) {
            notificationDispatcher.sendWelcomeMail(WelcomeEmailRequest.builder()
                    .doctorFirstName(doctor.getDoctorFirstNameWithSalutation())
                    .doctorEmail(req.getEmail())
                    .orgName(req.getBrand() != null ? req.getBrand() : "Dental Stack")
                    .companyName(userProfile.getOrgName())
                    .doctorRole(doctorRole)
                    .build());
        }
        return details;
    }

    @Transactional(rollbackFor = {BusinessException.class})
    public Doctor addProfile(AddProfileRequest req) {
        Doctor doctor = doctorRepository
                .findByIdWithAllDetails(req.getInvitedDotorId())
                .orElseThrow(() -> new DoctorNotFoundException(req.getInviterDoctorId()));

        var organization = organizationRepository
                .findById(req.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (doctor.getOrganizations().contains(organization)) {
            throw new OrganizationAlreadyPresentException();
        }

        Role doctorRole = roleRepository
                .findByName(String.valueOf(req.getRoles()))
                .orElseThrow(() -> new RuntimeException("Role not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(doctorRole);
        var inviterUserProfile = userProfileRepository
                .findById(req.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(req.getInviterDoctorId()));

        var user = User.builder()
                .userType(UserType.DOCTOR)
                .mobileNo(doctor.getMobile())
                .email(doctor.getEmail())
                .status(UserStatus.ACTIVE)
                .firstName((doctor.getFirstName()))
                .lastName(doctor.getLastName())
                .salutation(doctor.getSalutation())
                .countryCode(CountryCode.fromCode(doctor.getCountryCode()))
                .UUID(DoctorMapper.generateUUID(UserType.DOCTOR))
                .displayName(doctor.getSalutation() + ". " + doctor.getFirstName()
                        + (doctor.getLastName() != null ? " " + doctor.getLastName() : ""))
                .build();

        UserProfile userProfile = UserProfile.builder()
                .user(user)
                .doctor(doctor)
                .organization(organization)
                .profileType(ProfileType.INVITED)
                .status(ProfileStatus.ACTIVE)
                .roles(roles)
                .inviterProfile(inviterUserProfile)
                .organizationBrandName(doctor.getOrgName())
                .isTrackingEnabled(true)
                .isStlFileViewEnabled(false)
                .build();
        userProfile = userProfileRepository.save(userProfile);

        if (doctor.getUserProfiles() == null) {
            doctor.setUserProfiles(new HashSet<>());
        }
        doctor.getUserProfiles().add(userProfile);
        organizationRepository.save(organization);

        doctor.getOrganizations().add(organization);

        return doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor createProfile(CreateUserProfile request) {
        var doctor = doctorRepository
                .findById(request.getDoctorId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        Organization organization = Organization.builder()
                .name(doctor.getFirstName() + " " + doctor.getLastName() + "'s Clinic")
                .type(OrganizationType.SELF_OWNED)
                .active(true)
                .build();

        organization = organizationRepository.save(organization);

        if (doctor.getOrganizations() == null) {
            doctor.setOrganizations(new HashSet<>());
        }
        doctor.getOrganizations().add(organization);

        doctorRepository.save(doctor);
        var subRole = getSubrole(request.getRoles());

        Set<Role> doctorRoles = request.getRoles().stream()
                .map(roleEnum -> roleRepository
                        .findByName(roleEnum.name())
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleEnum.name())))
                .collect(Collectors.toCollection(HashSet::new));

        var user = User.builder()
                .userType(UserType.DOCTOR)
                .mobileNo(doctor.getMobile())
                .email(doctor.getEmail())
                .status(UserStatus.ACTIVE)
                .firstName((doctor.getFirstName()))
                .lastName(doctor.getLastName())
                .salutation(doctor.getSalutation())
                .countryCode(CountryCode.fromCode(doctor.getCountryCode()))
                .UUID(DoctorMapper.generateUUID(UserType.DOCTOR))
                .displayName(doctor.getSalutation() + ". " + doctor.getFirstName()
                        + (doctor.getLastName() != null ? " " + doctor.getLastName() : ""))
                .build();

        UserProfile userProfile = UserProfile.builder()
                .user(user)
                .doctor(doctor)
                .organization(organization)
                .profileType(ProfileType.OWNER)
                .status(ProfileStatus.ACTIVE)
                .roles(doctorRoles)
                .subRole(subRole)
                .organizationBrandName(doctor.getOrgName())
                .plan(subRole != null ? subRole.getPlan() : null)
                .isTrackingEnabled(true)
                .isStlFileViewEnabled(false)
                .build();

        userProfileRepository.save(userProfile);

        if (doctor.getUserProfiles() == null) {
            doctor.setUserProfiles(new HashSet<>());
        }
        doctor.getUserProfiles().add(userProfile);
        doctor.setPrimaryUserProfile(userProfile);
        organizationRepository.save(organization);
        DoctorDetails.doctorDetails(doctor);
        patientService.createCustomerAndAddBasicPlan(ChargebeeCreateCustomerRequest.from(
                request.getProfileId(), doctor, request.getRoles(), userProfile.getId()));

        try {
            doctor = doctorRepository.save(doctor);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save doctor", e);
        }

        Doctor savedDoctor = doctor;
        notificationDispatcher.sendSlackNotification(savedDoctor, false);
        return savedDoctor;
    }

    public DoctorDetails getOrCreateDoctor(String email, String firstName, String lastName) {
        Optional<Doctor> doctor = doctorRepository.findByEmailAndActiveTrue(email);
        if (doctor.isPresent()) {
            return DoctorDetails.from(doctor.get());
        } else {
            AddDoctorRequest req = new AddDoctorRequest();
            req.setEmail(email);
            req.setFirstName(firstName);
            req.setLastName(lastName);
            var doctorNew = doctorRepository.save(DoctorMapper.fromAddRequest(req));
            return DoctorDetails.newEntry(doctorNew);
        }
    }

    SubRole getSubrole(List<DoctorRole> roles) {
        SubRole subRole = null;
        if (roles != null) {
            if (roles.stream().anyMatch(role -> "COMMERCIAL_ALIGNER_LAB".equals(role.name()))) {
                subRole = subRoleRepository
                        .findSubRoleByNameAndPlanNameWithPlan("SUPER_ADMIN", "DESIGN_LAB")
                        .orElse(null);
            } else if (roles.stream()
                    .anyMatch(role ->
                            "CONSULTING_ORTHODONTIST".equals(role.name()) || "CLINIC_OWNER".equals(role.name()))) {
                subRole = subRoleRepository
                        .findSubRoleByNameAndPlanNameWithPlan("SUPER_ADMIN", "LITE_PLAN")
                        .orElse(null);
            } else if (roles.stream().anyMatch(role -> "IN_OFFICE_MANUFACTURER".equals(role.name()))) {
                subRole = subRoleRepository
                        .findSubRoleByNameAndPlanNameWithPlan("SUPER_ADMIN", "GROWTH_PLAN")
                        .orElse(null);
            } else if (roles.stream().anyMatch(role -> "ALIGNER_COMPANY_OR_LAB".equals(role.name()))) {
                subRole = subRoleRepository
                        .findSubRoleByNameAndPlanNameWithPlan("SUPER_ADMIN", "PROFESSIONAL")
                        .orElse(null);
            } else if (roles.stream().anyMatch(role -> "LAB_STAFF".equals(role.name()))) {
                subRole = subRoleRepository
                        .findSubRoleByNameAndPlanNameWithPlan("SUPER_ADMIN", "DESIGN_LAB")
                        .orElse(null);
            } else if (roles.stream().anyMatch(role -> "ENTERPRISE_COMPANY_LAB".equals(role.name()))) {
                subRole = subRoleRepository
                        .findSubRoleByNameAndPlanNameWithPlan("SUPER_ADMIN", "ENTERPRISE")
                        .orElse(null);
            }
        }
        return subRole;
    }
}
