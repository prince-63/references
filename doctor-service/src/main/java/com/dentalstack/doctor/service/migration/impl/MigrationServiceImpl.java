package com.dentalstack.doctor.service.migration.impl;

import com.dentalstack.doctor.constant.SubscriptionConstant;
import com.dentalstack.doctor.dto.subscription.Subscription;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.PracticeLocation;
import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.entity.patient.Patient;
import com.dentalstack.doctor.entity.patient.organization.PatientDoctorOrganization;
import com.dentalstack.doctor.entity.subscription.SubscriptionPlan;
import com.dentalstack.doctor.entity.subscription.SubscriptionUserMapping;
import com.dentalstack.doctor.entity.subscription.chargebee.ChargebeeEvent;
import com.dentalstack.doctor.entity.subscription.chargebee.ChargebeeEventContent;
import com.dentalstack.doctor.entity.subscription.chargebee.DoctorSubscriptionResponse;
import com.dentalstack.doctor.entity.user.Role;
import com.dentalstack.doctor.entity.user.User;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.UserType;
import com.dentalstack.doctor.enums.invitation.PatientBelongsTo;
import com.dentalstack.doctor.enums.organization.OrganizationType;
import com.dentalstack.doctor.enums.organization.ProfileStatus;
import com.dentalstack.doctor.enums.organization.ProfileType;
import com.dentalstack.doctor.enums.user.CountryCode;
import com.dentalstack.doctor.enums.user.UserStatus;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.repository.PracticeLocationRepository;
import com.dentalstack.doctor.repository.chargebee.ChargebeeRepository;
import com.dentalstack.doctor.repository.chargebee.SubscriptionRepository;
import com.dentalstack.doctor.repository.chargebee.SubscriptionUserMappingRepository;
import com.dentalstack.doctor.repository.patient.PatientRepository;
import com.dentalstack.doctor.repository.user.OrganizationRepository;
import com.dentalstack.doctor.repository.user.RoleRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.migration.MigrationService;
import jakarta.persistence.EntityNotFoundException;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class MigrationServiceImpl implements MigrationService {

    private final DoctorRepository doctorRepository;

    private final OrganizationRepository organizationRepository;

    private final UserProfileRepository userProfileRepository;

    private final RoleRepository roleRepository;
    private final PatientRepository patientRepository;
    private final ChargebeeRepository chargebeeRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;
    private final PracticeLocationRepository practiceLocationRepository;

    @Override
    public void migrateDoctor(Long doctorId) {
        Doctor doctor = doctorRepository
                .findByIdWithAllDetailsWithProfile(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + doctorId));

        Organization organization = Organization.builder()
                .name(doctor.getFirstName() + " " + doctor.getLastName() + "'s Clinic")
                .type(OrganizationType.SELF_OWNED)
                .active(true)
                .build();

        organization = organizationRepository.save(organization);

        User user = User.builder()
                .userType(UserType.DOCTOR)
                .mobileNo(doctor.getMobile())
                .email(doctor.getEmail())
                .status(UserStatus.ACTIVE)
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .countryCode(CountryCode.fromCode(doctor.getCountryCode()))
                .salutation("Dr")
                .UUID(doctor.getUUID())
                .build();

        Role doctorRole = roleRepository
                .findByName("CONSULTING_ORTHODONTIST")
                .orElseThrow(() -> new EntityNotFoundException("Role not found: CONSULTING_ORTHODONTIST"));
        Set<Role> doctorRoles = new HashSet<>();
        doctorRoles.add(doctorRole);

        UserProfile userProfile = UserProfile.builder()
                .user(user)
                .doctor(doctor)
                .organization(organization)
                .profileType(ProfileType.OWNER)
                .status(ProfileStatus.ACTIVE)
                .roles(doctorRoles)
                .build();

        userProfile = userProfileRepository.save(userProfile);

        if (doctor.getUserProfiles() == null) {
            doctor.setUserProfiles(new HashSet<>());
        }

        if (doctor.getOrganizations() == null) {
            doctor.setOrganizations(new HashSet<>());
        }
        doctor.getUserProfiles().add(userProfile);
        doctor.setPrimaryUserProfile(userProfile);
        doctor.getOrganizations().add(organization);

        var chargebeeEvent = getLatestChargebeeEvent(doctor.getEmail());
        if (chargebeeEvent != null) {
            SubscriptionPlan subscriptionPlan = saveSubscriptionPlan(chargebeeEvent);
            createSubscriptionUserMapping(doctorId, userProfile.getId(), subscriptionPlan);
        }

        doctorRepository.save(doctor);
    }

    @Override
    public void migratePracticeLocation(Long practiceLocationId) {
        // Find practice location
        PracticeLocation practiceLocation = practiceLocationRepository
                .findById(practiceLocationId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Practice Location not found with id: " + practiceLocationId));

        // Get doctor using doctorId from practice location
        Doctor doctor = doctorRepository
                .findByIdWithAllDetailsWithProfile(practiceLocation.getDoctorId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Doctor not found with id: " + practiceLocation.getDoctorId()));

        // Get the latest user profile from doctor's profiles
        UserProfile latestUserProfile = doctor.getUserProfiles().stream()
                .max(Comparator.comparing(UserProfile::getCreatedAt))
                .orElseThrow(() -> new EntityNotFoundException("No user profile found for doctor: " + doctor.getId()));

        // Get organization from the latest user profile
        Organization organization = latestUserProfile.getOrganization();
        if (organization == null) {
            throw new EntityNotFoundException("No organization found for user profile: " + latestUserProfile.getId());
        }

        // Update practice location with user profile and organization
        practiceLocation.setUserProfile(latestUserProfile);
        practiceLocation.setOrganization(organization);

        // Save updated practice location
        practiceLocationRepository.save(practiceLocation);
    }

    public void migratePatient(Patient patient, Long profileId) {

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));
        PatientDoctorOrganization patientDoctorOrganization = PatientDoctorOrganization.builder()
                .patient(patient)
                .doctor(userProfile.getDoctor())
                .organization(userProfile.getOrganization())
                .addedByUserProfile(userProfile)
                .userProfile(userProfile)
                .active(true)
                .isPracticeAssigned(true)
                .patientBelongsTo(PatientBelongsTo.ORTHODONTIC_PATIENT)
                .build();

        patient.setDoctorOrganization(patientDoctorOrganization);
        patientRepository.save(patient);
    }

    @Override
    public void migrateAllDoctors() {
        int batchSize = 100;
        List<Long> doctorIds = doctorRepository.findAllDoctorId();

        for (int i = 0; i < doctorIds.size(); i += batchSize) {
            List<Long> batch = doctorIds.subList(i, Math.min(i + batchSize, doctorIds.size()));

            batch.parallelStream().forEach(doctorId -> {
                try {
                    migrateDoctor(doctorId);
                } catch (Exception ignore) {
                }
            });
        }
    }

    @Override
    public void migrateAllPracticeLocations() {
        int batchSize = 100;
        List<Long> practiceLocationIds = practiceLocationRepository.findAllPracticeLocationIds();

        for (int i = 0; i < practiceLocationIds.size(); i += batchSize) {
            List<Long> batch = practiceLocationIds.subList(i, Math.min(i + batchSize, practiceLocationIds.size()));

            batch.parallelStream().forEach(practiceLocationId -> {
                try {
                    migratePracticeLocation(practiceLocationId);
                } catch (Exception ignore) {

                }
            });
        }
    }

    @Override
    public void migrateAllPatient() {
        int batchSize = 100;
        List<Long> patientIds = patientRepository.findAllPatientId();

        for (int i = 0; i < patientIds.size(); i += batchSize) {
            List<Long> batch = patientIds.subList(i, Math.min(i + batchSize, patientIds.size()));
            batch.parallelStream().forEach(patientId -> {
                try {
                    Patient patient = patientRepository
                            .findById(patientId)
                            .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + patientId));

                    Long doctorId = patient.getAddedByUserId();
                    List<UserProfile> userProfiles = userProfileRepository.findByDoctorId(doctorId);

                    if (userProfiles.isEmpty()) {
                        throw new EntityNotFoundException("No UserProfile found for Doctor ID: " + doctorId);
                    }

                    UserProfile profile = userProfiles.get(0);
                    migratePatient(patient, profile.getId());
                } catch (Exception ignore) {
                }
            });
        }
    }

    @Override
    public void migratePatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId).orElseThrow();
        try {
            var doctorId = patient.getAddedByUserId();
            List<UserProfile> userProfile = userProfileRepository.findByDoctorId(doctorId);
            var profile = userProfile.get(0);

            migratePatient(patient, profile.getId());
        } catch (Exception ignored) {
        }
    }

    public ChargebeeEvent getLatestChargebeeEvent(String email) {
        try {
            return chargebeeRepository.findByEmail(email).stream()
                    .filter(event -> Set.of(
                                    SubscriptionConstant.SUBSCRIPTION_CREATED,
                                    SubscriptionConstant.SUBSCRIPTION_CHANGED,
                                    SubscriptionConstant.EXTEND_SUBSCRIPTION)
                            .contains(event.getEventType()))
                    .max(Comparator.comparing(ChargebeeEvent::getUpdatedAt).thenComparing(ChargebeeEvent::getEventType))
                    .orElseThrow();
        } catch (Exception ignored) {
        }
        return null;
    }

    private SubscriptionPlan saveSubscriptionPlan(ChargebeeEvent chargebeeEvent) {

        ChargebeeEventContent content = chargebeeEvent.getContent();
        ChargebeeEventContent.Subscription subscription = content.getSubscription();

        int totalPatients = 0;
        int totalStorageGb = 0;

        if (subscription != null && subscription.getSubscriptionItems() != null) {
            totalStorageGb = calculateTotalStorage(subscription.getSubscriptionItems());

            List<DoctorSubscriptionResponse.SubscriptionItemDetails> subscriptionItemDetails = Arrays.stream(
                            subscription.getSubscriptionItems())
                    .map(item -> DoctorSubscriptionResponse.SubscriptionItemDetails.builder()
                            .amount(item.getAmount())
                            .object(item.getObject())
                            .itemType(item.getItemType())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .freeQuantity(item.getFreeQuantity())
                            .itemPriceId(item.getItemPriceId())
                            .build())
                    .toList();

            if (!subscriptionItemDetails.isEmpty()) {
                var details = subscriptionItemDetails.get(0);
                totalPatients = details.getQuantity();
            }

            String status = subscription.getStatus();
            String planType = null;

            if (!subscriptionItemDetails.isEmpty()) {
                var details = subscriptionItemDetails.get(0);
                totalPatients = details.getQuantity();
                planType = details.getItemPriceId();
            }

            if (SubscriptionConstant.STATUS_IN_TRIAL.equals(status)) {
                status = SubscriptionConstant.STATUS_TRIAL;
                planType = SubscriptionConstant.PLAN_TRIAL;
            } else {
                if (SubscriptionConstant.STATUS_ACTIVE.equals(status)) {
                    status = SubscriptionConstant.STATUS_ACTIVE_UPPER;
                }
                if (SubscriptionConstant.PLAN_BASIC_MONTHLY.equals(planType)
                        || SubscriptionConstant.PLAN_BASIC_YEARLY.equals(planType)) {
                    planType = SubscriptionConstant.PLAN_BASIC;
                }
            }
            if (SubscriptionConstant.STATUS_IN_FREE_TRIAL.equals(planType)) {
                status = SubscriptionConstant.STATUS_TRIAL;
            }

            boolean isTrialPlan = status.equalsIgnoreCase(SubscriptionConstant.STATUS_IN_TRIAL)
                    || status.equalsIgnoreCase(SubscriptionConstant.STATUS_IN_FREE_TRIAL);

            Subscription.PlanMetadata planMetadata = Subscription.PlanMetadata.builder()
                    .isTrialPlan(isTrialPlan)
                    .nextBillingAt(chargebeeEvent.getSubscriptionEndDate().plusDays(1))
                    .currentTermStart(chargebeeEvent.getSubscriptionStartDate())
                    .currentTermEnd(chargebeeEvent.getSubscriptionEndDate())
                    .status(Subscription.PlanStatus.ACTIVE)
                    .planName(Subscription.PlanName.STARTER)
                    .planType(Subscription.PlanType.YEARLY)
                    .build();

            SubscriptionPlan subscriptionPlan = SubscriptionPlan.builder()
                    .totalPatients(totalPatients)
                    .totalStorageGb(totalStorageGb)
                    .planMetadata(planMetadata)
                    .build();

            return subscriptionRepository.save(subscriptionPlan);
        }
        return null;
    }

    private void createSubscriptionUserMapping(Long doctorId, Long userProfileId, SubscriptionPlan subscriptionPlan) {
        SubscriptionUserMapping subscriptionUserMapping = SubscriptionUserMapping.builder()
                .doctorId(doctorId)
                .subscriptionPlan(subscriptionPlan)
                .userProfileId(userProfileId)
                .isAdmin(true)
                .build();

        subscriptionUserMappingRepository.save(subscriptionUserMapping);
    }

    private static int calculateTotalStorage(ChargebeeEventContent.Subscription.SubscriptionItem[] subscriptionItems) {
        return Arrays.stream(subscriptionItems)
                .filter(item -> SubscriptionConstant.ADD_ON.equals(item.getItemType())
                        && (SubscriptionConstant.MONTHLY.equals(item.getItemPriceId())
                                || SubscriptionConstant.YEARLY.equals(item.getItemPriceId())))
                .mapToInt(ChargebeeEventContent.Subscription.SubscriptionItem::getQuantity)
                .sum();
    }
}
