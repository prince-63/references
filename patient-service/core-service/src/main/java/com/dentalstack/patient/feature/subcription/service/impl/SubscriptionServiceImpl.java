package com.dentalstack.patient.feature.subcription.service.impl;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.DoctorRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorDashboardService;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountRequest;
import com.dentalstack.patient.feature.invitation.service.InvitationService;
import com.dentalstack.patient.feature.notification.dto.OrgWhatsAppDetails;
import com.dentalstack.patient.feature.notification.dto.WelcomeEmailRequest;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.SlackService;
import com.dentalstack.patient.feature.notification.util.ResolveOrgName;
import com.dentalstack.patient.feature.notification.util.WhatsAppUtilities;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.projection.OrderCountSummary;
import com.dentalstack.patient.feature.order.repository.ManufacturingRepository;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.rbac.entity.SubRole;
import com.dentalstack.patient.feature.rbac.repository.RoleRepository;
import com.dentalstack.patient.feature.rbac.repository.SubRoleRepository;
import com.dentalstack.patient.feature.rewards.service.RewardTaskConfigService;
import com.dentalstack.patient.feature.storage.files.util.FileStorageProvider;
import com.dentalstack.patient.feature.subcription.constant.SubscriptionConstant;
import com.dentalstack.patient.feature.subcription.dto.*;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionAccountUpgrade;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionPlan;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionUserMapping;
import com.dentalstack.patient.feature.subcription.exception.SubscriptionNotFoundException;
import com.dentalstack.patient.feature.subcription.provider.PatientMetricsProvider;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionAccountUpgradeRepository;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionRepository;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionUserMappingRepository;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.vsp.repository.VspOrderRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.service.DefaultWorkflowService;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.global.exception.GenericException;
import com.dentalstack.patient.global.utils.PlanUtils;
import jakarta.annotation.Nullable;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final DoctorService doctorService;
    private final FileStorageProvider fileStorageProvider;
    private final PatientMetricsProvider patientMetricsProvider;
    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionAccountUpgradeRepository subscriptionAccountUpgradeRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrderRepository orderRepository;
    private final ChatService chatService;
    private final SlackService slackService;
    private final DoctorRepository doctorRepository;
    private final DefaultWorkflowService defaultWorkflowService;
    private final RoleRepository roleRepository;
    private final SubRoleRepository subRoleRepository;
    private final InvitationService invitationService;
    private final DoctorDashboardService doctorDashboardService;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final RewardTaskConfigService rewardTaskConfigService;
    private final WhatsAppUtilities whatsAppUtilities;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final ManufacturingRepository manufacturingRepository;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final VspOrderRepository vspOrderRepository;

    @Transactional(readOnly = true)
    public SubscriptionPlanDTO getSubSubscriptionDetails(Long doctorId, Long userProfileId) {
        UserProfile userProfile =
                userProfileRepository.findByIdWithOrgAndDoctor(userProfileId).orElseThrow(DoctorNotFoundException::new);

        // If user is invited, find and use the inviter profile instead
        if (!userProfile.isOwner()) {
            userProfile = userProfile.getInviterProfile();
            if (userProfile == null) {
                throw new DoctorNotFoundException();
            }
            userProfileId = userProfile.getId();
            if (userProfile.getDoctor() != null) {
                doctorId = userProfile.getDoctor().getId();
            }
        }

        boolean isLabDeactivated = resolveLabStaffDeactivationStatus(
                doctorId, userProfile.getOrganization().getId(), userProfileId);

        Optional<SubscriptionUserMapping> subscriptionUserMapping =
                subscriptionUserMappingRepository.findByDoctorIdAndUserProfileIdWithSubscriptionPlan(
                                        userProfileId, doctorId)
                                != null
                        ? Optional.of(
                                subscriptionUserMappingRepository.findByDoctorIdAndUserProfileIdWithSubscriptionPlan(
                                        userProfileId, doctorId))
                        : Optional.empty();
        if (subscriptionUserMapping.isPresent()) {

            var usedStorageByDoctor = fileStorageProvider.calculateDoctorTotalFileSize(
                    userProfile.getOrganization().getId());

            var patientCount = doctorDashboardService.activePatient(doctorId, userProfileId);

            var subscriptionResponse =
                    SubscriptionPlanDTO.from(subscriptionUserMapping.get().getSubscriptionPlan(), userProfile);

            subscriptionResponse.setTotalUsedPatients(
                    patientCount.getNewActivePatient().intValue());
            if (subscriptionResponse.getTotalOrders() > 0) {
                List<UserProfile> userProfiles = new ArrayList<>();

                if (userProfile.getProfileType().equals(ProfileType.INVITED)) {
                    userProfiles.add(userProfile);
                } else {
                    userProfiles.addAll(userProfileRepository.findAllByOrganizationIdAndProfileTypeInWithDoctorAndRoles(
                            userProfile.getOrganization().getId(), List.of(ProfileType.INVITED, ProfileType.OWNER)));
                }

                List<String> itemName = serviceConfigurationRepository.findEnabledItemNames(userProfileId);
                if (itemName.contains("PLANNING")) {
                    int count = orderRepository.findCountByProfileId(userProfileId);
                    subscriptionResponse.setUsedOrders(count);
                } else if (itemName.contains("MANUFACTURING")) {
                    int count = patientTaskTrackerRepository.findUniquePatientCount(userProfileId);
                    subscriptionResponse.setUsedManufacturings(count);
                    subscriptionResponse.setTotalUsedPatients(count);
                } else if (itemName.contains("VSP PLANNING")) {
                    int count = vspOrderRepository.findCountByProfileId(userProfileId);
                    subscriptionResponse.setUsedOrders(count);
                } else {
                    Set<String> requesterRoles = getRoleNames(userProfile.getRoles());
                    boolean isCommercialAlignerLab = requesterRoles.contains(DoctorRole.COMMERCIAL_ALIGNER_LAB.name());
                    if (isCommercialAlignerLab) {
                        OrderCountSummary orderCountSummary =
                                orderRepository.countsOfReceivedAndSentOrders(userProfileId);
                        subscriptionResponse.setUsedOrders(
                                orderCountSummary != null ? Math.toIntExact(orderCountSummary.getReceivedCount()) : 0);
                    } else {
                        List<Long> labProfileIds = new ArrayList<>();
                        List<Long> customerProfileIds = new ArrayList<>();
                        List<Long> regularProfileIds = new ArrayList<>();

                        for (UserProfile profile : userProfiles) {
                            if (profile.getDoctor() == null) {
                                continue;
                            }
                            Set<String> profileRoles = getRoleNames(profile.getRoles());
                            if (profileRoles.contains(DoctorRole.LAB_STAFF.name())
                                    || profileRoles.contains(DoctorRole.COMMERCIAL_ALIGNER_LAB.name())) {
                                labProfileIds.add(profile.getId());
                            } else if (isCommercialAlignerLab && profileRoles.contains(DoctorRole.CUSTOMER.name())) {
                                customerProfileIds.add(profile.getId());
                            } else {
                                regularProfileIds.add(profile.getId());
                            }
                        }

                        Set<String> orderIds = new HashSet<>();
                        Long organizationId = userProfile.getOrganization().getId();
                        if (!labProfileIds.isEmpty()) {
                            orderIds.addAll(
                                    orderRepository
                                            .findDistinctOrderIdsByAssignedLabUserIdsAndOrganizationIdAndStatusNot(
                                                    labProfileIds, organizationId, OrderStatus.DRAFT));
                        }
                        if (!customerProfileIds.isEmpty()) {
                            orderIds.addAll(
                                    orderRepository.findDistinctOrderIdsByProfileIdsAndOrganizationIdAndStatusNot(
                                            customerProfileIds, organizationId, OrderStatus.DRAFT));
                        }
                        if (!regularProfileIds.isEmpty()) {
                            orderIds.addAll(orderRepository.findDistinctOrderIdsByProfileIdsAndOrganizationId(
                                    regularProfileIds, organizationId));
                        }
                        subscriptionResponse.setUsedOrders(orderIds.size());
                    }
                }
            }
            subscriptionResponse.setProfileId(userProfileId);
            subscriptionResponse.setUsedStorageGb(usedStorageByDoctor);
            subscriptionResponse.setIsLabStaffDeactivated(isLabDeactivated);
            subscriptionResponse.setIsPlanUpgraded(subscriptionResponse.getIsPlanUpgraded());
            subscriptionResponse.setIsHasDonePractice(subscriptionResponse.getIsHasDonePractice());

            return subscriptionResponse;
        } else {
            throw new SubscriptionNotFoundException(doctorId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanDTO> getAllSubSubscriptionDetails(Long doctorId) {

        List<SubscriptionUserMapping> subscriptionUserMappings =
                subscriptionUserMappingRepository.findByDoctorIdWithSubscriptionPlan(doctorId);

        if (subscriptionUserMappings.isEmpty()) {
            throw new SubscriptionNotFoundException(doctorId);
        }

        var usedStorageByDoctor = fileStorageProvider.calculateDoctorTotalFileSizeByDoctorId(doctorId);
        var patientCount = doctorDashboardService.activePatient(doctorId);

        List<Long> profileIds = subscriptionUserMappings.stream()
                .map(SubscriptionUserMapping::getUserProfileId)
                .collect(Collectors.toList());

        Map<Long, UserProfile> userProfileMap =
                userProfileRepository.findUserProfilesWithPlanHierarchy(profileIds).stream()
                        .collect(Collectors.toMap(UserProfile::getId, Function.identity()));

        return subscriptionUserMappings.stream()
                .map(subscriptionUserMapping -> {
                    UserProfile userProfile = userProfileMap.get(subscriptionUserMapping.getUserProfileId());

                    var subscriptionResponse =
                            SubscriptionPlanDTO.allSubscription(subscriptionUserMapping, userProfile);
                    subscriptionResponse.setTotalUsedPatients(
                            patientCount.getNewActivePatient().intValue());
                    subscriptionResponse.setUsedStorageGb(usedStorageByDoctor);
                    return subscriptionResponse;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void createCustomerAndSubscription(SubscriptionRequest request) {
        createManualEvent(request);
    }

    @Override
    public SubscriptionPlanDTO extendCurrentSubscription(SubscriptionPlanDTO request) {
        SubscriptionPlan subscriptionPlan = subscriptionRepository
                .findById(request.getId())
                .orElseThrow(() -> new SubscriptionNotFoundException(request.getId()));
        var userProfileSummary = userProfileRepository
                .userProfileDetailsById(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var userProfile = userProfileRepository.findByIdWithOrgAndDoctorAndUser(request.getProfileId());

        if (!request.isHasPlanStartedConsent()) {
            slackService.sendSubscriptionUpdateMessage(userProfileSummary, request, subscriptionPlan);
        }
        subscriptionPlan.setPlanMetadata(request.getPlanMetadata());
        subscriptionPlan.setTotalPatients(request.getTotalPatients());
        subscriptionPlan.setTotalStorageGb(request.getTotalStorageGb());
        subscriptionPlan.setHasPlanStartedConsent(request.isHasPlanStartedConsent());
        subscriptionPlan.setTotalOrders(request.getTotalOrders());

        subscriptionRepository.save(subscriptionPlan);

        if (!request.isHasPlanStartedConsent() && userProfile.isPresent()) {
            if (request.isTopUp()) {
                chatService.topUpSuccess(SubscriptionEmailRequest.builder()
                        .practiceDisplayName(userProfile.get().getOrgName())
                        .planName(PlanUtils.formatPlanForDisplay(
                                String.valueOf(request.getPlanMetadata().getPlanName())))
                        .email(userProfile.get().getUser().getEmail())
                        .storageLimit(request.getTotalStorageGb())
                        .planStartDate((request.getPlanMetadata().getCurrentTermStart()))
                        .planEndDate((request.getPlanMetadata().getCurrentTermEnd()))
                        .orgName(userProfile.get().getOrganizationBrandName())
                        .build());
            } else {
                var doctorRole = getRole(userProfile.get().getRoles());

                int totalUser;
                assert doctorRole != null;
                String patientOrOrder;
                if (doctorRole.equals(DoctorRole.COMMERCIAL_ALIGNER_LAB)) {
                    totalUser = request.getTotalOrders();
                    patientOrOrder = "Orders";
                } else {
                    totalUser = request.getTotalPatients();
                    patientOrOrder = "Patients";
                }
                chatService.subscriptionUpgraded(SubscriptionEmailRequest.builder()
                        .practiceDisplayName(userProfile.get().getOrgName())
                        .planName(PlanUtils.formatPlanForDisplay(
                                String.valueOf(request.getPlanMetadata().getPlanName())))
                        .email(userProfile.get().getUser().getEmail())
                        .patientOrOrder(patientOrOrder)
                        .userLimit(totalUser)
                        .storageLimit(request.getTotalStorageGb())
                        .planStartDate((request.getPlanMetadata().getCurrentTermStart()))
                        .planEndDate((request.getPlanMetadata().getCurrentTermEnd()))
                        .email(userProfile.get().getUser().getEmail())
                        .orgName(userProfile.get().getOrganizationBrandName())
                        .build());
            }
        }

        return SubscriptionPlanDTO.from(request);
    }

    @Transactional
    public void deactivateAccount(Long doctorId, String authCode) {
        List<SubscriptionUserMapping> mappings =
                subscriptionUserMappingRepository.findByDoctorIdWithSubscriptionPlan(doctorId);

        if (mappings.isEmpty()) {
            throw new SubscriptionNotFoundException(doctorId);
        }

        ZonedDateTime oneDayBeforeToday = ZonedDateTime.now().minusDays(1);

        for (SubscriptionUserMapping mapping : mappings) {
            SubscriptionPlan subscription = mapping.getSubscriptionPlan();
            SubscriptionPlanDTO.PlanMetadata metadata = subscription.getPlanMetadata();

            metadata.setNextBillingAt(oneDayBeforeToday);
            metadata.setCurrentTermEnd(oneDayBeforeToday);
            metadata.setStatus(SubscriptionPlanDTO.PlanStatus.INACTIVE);
            mapping.setIsPlanUpgraded(true);
            subscription.setRequestedForDeactivation(true);

            subscription.setPlanMetadata(metadata);
            subscriptionRepository.save(subscription);
        }
    }

    private boolean resolveLabStaffDeactivationStatus(Long doctorId, Long organizationId, Long userProfileId) {
        try {
            var doctorDetailsFuture = CompletableFuture.supplyAsync(() -> doctorService.getInvitationCountOfAllRoles(
                    DoctorInvitationCountRequest.from(doctorId, organizationId, userProfileId, false)));
            var doctorDetails = doctorDetailsFuture
                    .completeOnTimeout(null, 1200, TimeUnit.MILLISECONDS)
                    .exceptionally(ex -> null)
                    .join();
            return doctorDetails != null && Boolean.TRUE.equals(doctorDetails.getIsLabStaffDeactivated());
        } catch (Exception ignored) {
            return false;
        }
    }

    private Set<String> getRoleNames(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return Collections.emptySet();
        }
        return roles.stream().map(Role::getName).collect(Collectors.toSet());
    }

    @Nullable
    private DoctorRole getRole(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .map(name -> {
                    try {
                        return DoctorRole.valueOf(name);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    @Transactional
    public void createManualEvent(SubscriptionRequest request) {
        if (request == null || request.getUserProfileId() == null) {
            throw new IllegalArgumentException(
                    "Invalid subscription request: Doctor ID and User Profile ID must not be null.");
        }

        SubscriptionPlan subscriptionPlan;

        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime endDate = now.plusDays(SubscriptionConstant.PLAN_TRIAL_DAYS);

        SubscriptionPlanDTO subscriptionPlanDTO = buildSubscriptionPlanDTO(request, now, endDate);
        Long inviterId = request.getInviterId();
        if (request.getRoles().contains(DoctorRole.IN_OFFICE_MANUFACTURER)
                || request.getRoles().contains(DoctorRole.CONSULTING_ORTHODONTIST)
                || request.getRoles().contains(DoctorRole.COMMERCIAL_ALIGNER_LAB)
                || request.getRoles().contains(DoctorRole.CUSTOMER)
                || request.getRoles().contains(DoctorRole.ENTERPRISE_COMPANY_LAB)
                || request.getRoles().contains(DoctorRole.ALIGNER_COMPANY_OR_LAB)) {
            var profileId = Boolean.TRUE.equals(request.getIsProfileCreating())
                    ? request.getNewProfileId()
                    : request.getUserProfileId();
            if (profileId != null) {
                defaultWorkflowService.createDefaultWorkflows(profileId);

                if (request.getInvitationCode() != null
                        && !request.getInvitationCode().isEmpty()) {
                    invitationService.createPatientTaskTracker(profileId, request.getInvitationCode());
                }
            }
        }
        if (request.getRoles().contains(DoctorRole.IN_OFFICE_MANUFACTURER)
                || request.getRoles().contains(DoctorRole.CONSULTING_ORTHODONTIST)) {
            var profileId = Boolean.TRUE.equals(request.getIsProfileCreating())
                    ? request.getNewProfileId()
                    : request.getUserProfileId();
            rewardTaskConfigService.cloneDefaultTasks(profileId);
        }
        var doctor = doctorRepository
                .findByEmailAndOrganizationIdAndXOrgName(
                        request.getEmail(), request.getOrganizationId(), request.getXOrgName())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getUserProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getUserProfileId()));

        if (Optional.ofNullable(inviterId).isPresent() && inviterId != 0L) {
            SubscriptionUserMapping existingMappping =
                    subscriptionUserMappingRepository.findByDoctorIdAndUserProfileIdWithSubscriptionPlan(
                            request.getInviterProfileId(), request.getInviterId());
            if (existingMappping != null) {
                createSubscriptionUserMapping(request, existingMappping.getSubscriptionPlan(), false);
                slackService.sendSlackNotification(
                        doctor,
                        existingMappping
                                .getSubscriptionPlan()
                                .getPlanMetadata()
                                .getPlanName()
                                .name(),
                        userProfile.getProfileType().name(),
                        userProfile.getRoles().iterator().next().getName(),
                        userProfile);
            }
        } else {
            subscriptionPlan = saveSubscriptionPlan(subscriptionPlanDTO);

            chatService.sendWelcomeMailToUser(WelcomeEmailRequest.from(
                    subscriptionPlan, doctor, request.getRoles().get(0), userProfile));

            createSubscriptionUserMapping(request, subscriptionPlan, true);
            slackService.sendSlackNotification(
                    doctor,
                    subscriptionPlan.getPlanMetadata().getPlanName().name(),
                    userProfile.getProfileType().name(),
                    userProfile.getRoles().iterator().next().getName(),
                    userProfile);
        }
    }

    private SubscriptionPlanDTO buildSubscriptionPlanDTO(
            SubscriptionRequest request, ZonedDateTime now, ZonedDateTime endDate) {
        boolean isClinicOwnerOrConsultingOrthodontist = request.getRoles().contains(DoctorRole.IN_OFFICE_MANUFACTURER);

        boolean isAlignerAndCompanyLab = request.getRoles().contains(DoctorRole.ALIGNER_COMPANY_OR_LAB);
        boolean isEnterPrise = request.getRoles().contains(DoctorRole.ENTERPRISE_COMPANY_LAB);

        boolean isCommercialAlignerLab = request.getRoles().contains(DoctorRole.COMMERCIAL_ALIGNER_LAB);
        boolean isVendor = request.getRoles().contains(DoctorRole.VENDOR);

        SubscriptionPlanDTO.PlanName planName;
        int totalPatients;
        int totalStorageGb;
        int totalUsers = 0;
        int totalOrders = 0;

        if (isCommercialAlignerLab) {
            planName = SubscriptionPlanDTO.PlanName.DESIGN_LAB;
            totalPatients = SubscriptionConstant.DESIGN_LAB_TOTAL_PATIENTS;
            totalStorageGb = SubscriptionConstant.DESIGN_LAB_TOTAL_STORAGE;
            totalUsers = SubscriptionConstant.DESIGN_LAB_TOTAL_USERS;
            totalOrders = SubscriptionConstant.DESIGN_LAB_TOTAL_ORDERS;
        } else if (isClinicOwnerOrConsultingOrthodontist) {
            planName = SubscriptionPlanDTO.PlanName.GROWTH;
            totalPatients = SubscriptionConstant.GROWTH_PLAN_TOTAL_PATIENTS;
            totalStorageGb = SubscriptionConstant.GROWTH_PLAN_TOTAL_STORAGE;
        } else if (isVendor) {
            planName = SubscriptionPlanDTO.PlanName.VENDOR;
            totalPatients = SubscriptionConstant.GROWTH_PLAN_TOTAL_PATIENTS;
            totalStorageGb = SubscriptionConstant.GROWTH_PLAN_TOTAL_STORAGE;
            totalOrders = SubscriptionConstant.DESIGN_LAB_TOTAL_ORDERS;
        } else if (isAlignerAndCompanyLab) {
            planName = SubscriptionPlanDTO.PlanName.PROFESSIONAL;
            totalPatients = SubscriptionConstant.GROWTH_PLAN_TOTAL_PATIENTS;
            totalStorageGb = SubscriptionConstant.GROWTH_PLAN_TOTAL_STORAGE;
        } else if (isEnterPrise) {
            planName = SubscriptionPlanDTO.PlanName.ENTERPRISE;
            totalPatients = SubscriptionConstant.GROWTH_PLAN_TOTAL_PATIENTS;
            totalStorageGb = SubscriptionConstant.GROWTH_PLAN_TOTAL_PATIENTS;
            totalUsers = SubscriptionConstant.DESIGN_LAB_TOTAL_USERS;
            totalOrders = SubscriptionConstant.DESIGN_LAB_TOTAL_ORDERS;
        } else {
            planName = SubscriptionPlanDTO.PlanName.STARTER;
            totalPatients = SubscriptionConstant.STARTER_PLAN_TOTAL_PATIENTS;
            totalStorageGb = SubscriptionConstant.STARTER_PLAN_TOTAL_STORAGE;
        }

        return SubscriptionPlanDTO.builder()
                .totalPatients(totalPatients)
                .totalStorageGb(totalStorageGb)
                .totalUsers(totalUsers)
                .totalOrders(totalOrders)
                .planMetadata(SubscriptionPlanDTO.PlanMetadata.builder()
                        .isTrialPlan(true)
                        .nextBillingAt(endDate)
                        .currentTermStart(now)
                        .currentTermEnd(endDate)
                        .status(SubscriptionPlanDTO.PlanStatus.ACTIVE)
                        .planName(planName)
                        .planType(SubscriptionPlanDTO.PlanType.TRIAL)
                        .build())
                .build();
    }

    private SubscriptionPlan saveSubscriptionPlan(SubscriptionPlanDTO subscriptionPlanDTO) {
        return subscriptionRepository.save(SubscriptionPlan.builder()
                .totalPatients(subscriptionPlanDTO.getTotalPatients())
                .totalStorageGb(subscriptionPlanDTO.getTotalStorageGb())
                .totalUsers(subscriptionPlanDTO.getTotalUsers())
                .totalOrders(subscriptionPlanDTO.getTotalOrders())
                .planMetadata(subscriptionPlanDTO.getPlanMetadata())
                .isDemoCompleted(
                        subscriptionPlanDTO.getPlanMetadata().getPlanName() == SubscriptionPlanDTO.PlanName.ENTERPRISE
                                        || subscriptionPlanDTO.getPlanMetadata().getPlanName()
                                                == SubscriptionPlanDTO.PlanName.GROWTH
                                ? false
                                : null)
                .build());
    }

    public String fullName(String firstName, String lastName) {
        if (lastName != null) {
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }

    private void createSubscriptionUserMapping(
            SubscriptionRequest request, SubscriptionPlan subscriptionPlan, boolean isAdmin) {
        SubscriptionUserMapping subscriptionUserMapping = SubscriptionUserMapping.builder()
                .doctorId(request.getDoctorId())
                .subscriptionPlan(subscriptionPlan)
                .userProfileId(
                        Boolean.TRUE.equals(request.getIsProfileCreating())
                                ? request.getNewProfileId()
                                : request.getUserProfileId())
                .isAdmin(isAdmin)
                .build();

        subscriptionUserMappingRepository.save(subscriptionUserMapping);
    }

    public void requestForPlanUpgrade(SubscriptionAccountUpgradeRequestDTO request) {
        subscriptionAccountUpgradeRepository.save(SubscriptionAccountUpgrade.builder()
                .countryCode(request.getCountryCode())
                .mobile(request.getMobile())
                .currentPlanStartDate(request.getCurrentPlanStartDate())
                .currentPlanEndDate(request.getCurrentPlanEndDate())
                .doctorId(request.getDoctorId())
                .profileId(request.getProfileId())
                .currentPlanName(request.getCurrentPlanName())
                .newPlanName(request.getNewPlanName())
                .requestType(request.getRequestType())
                .userEmail(request.getUserEmail())
                .userName(request.getUserName())
                .notes(request.getNotes())
                .build());

        var userProfile = userProfileRepository.userProfileDetailsById(request.getProfileId());
        String formatPlanName = formatPlanName(request.getRequestType());

        if (request.getRequestType().equalsIgnoreCase("UPGRADE_PLAN")) {
            formatPlanName = upgradePlan(formatPlanName, request.getNewPlanName());
        }
        var planName = formatPlanName;

        userProfile.ifPresent(userProfileSummary -> {
            slackService.sendPlanUpgradeRequestMessage(userProfileSummary, request, planName);
        });
    }

    @Override
    public String makeFalseUpgradeFlag(Long userProfileId) {
        var subscriptionUserMapping = subscriptionUserMappingRepository
                .findByUserProfileId(userProfileId)
                .orElseThrow(() -> new SubscriptionNotFoundException(userProfileId));

        subscriptionUserMapping.setIsPlanUpgraded(false);
        subscriptionUserMappingRepository.save(subscriptionUserMapping);
        return "Successfully updated the upgrade flag to false for user profile ID: " + userProfileId;
    }

    @Transactional
    @Override
    public void upgradeSubscription(UpgradeSubscription request) {
        SubscriptionUserMapping subscriptionMapping = subscriptionUserMappingRepository
                .findByDoctorIdAndUserProfileId(request.getDoctorId(), request.getProfileId())
                .orElseThrow(() -> new GenericException("Subscription not found"));

        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new GenericException("User profile not found"));
        updateUserRoleBasedOnPlan(userProfile, request.getPlanName());
        updateSubRoleBasedOnPlan(userProfile, request.getPlanName());

        String email = userProfile.getUser().getEmail();
        String authCode = request.getAuthCode();

        boolean isAuthorized = email.contains("maildrop") || "Sdds.Atpl@0312".equals(authCode);

        if (!isAuthorized) {
            throw new GenericException("Unauthorized upgrade request");
        }

        SubscriptionPlan subscriptionPlan = subscriptionMapping.getSubscriptionPlan();

        if (subscriptionPlan == null) {
            throw new GenericException("Subscription plan not found");
        }

        updateBasicPlanInfo(subscriptionPlan, request);

        updatePlanMetadata(subscriptionPlan, request);

        updateCounts(subscriptionPlan, request);
    }

    private void updateSubRoleBasedOnPlan(UserProfile userProfile, SubscriptionPlanDTO.PlanName planName) {
        SubRole subRoleToAssign =
                switch (planName) {
                    case GROWTH -> subRoleRepository
                            .findSubRoleByNameAndPlanNameWithPlan("SUPER_ADMIN", "GROWTH_PLAN")
                            .orElse(null);
                    default -> subRoleRepository
                            .findSubRoleByNameAndPlanNameWithPlan("SUPER_ADMIN", "ENTERPRISE")
                            .orElse(null);
                };

        if (subRoleToAssign == null) {
            throw new GenericException("Appropriate sub-role not found for plan: " + planName);
        }
        userProfile.setPlan(subRoleToAssign.getPlan());
        userProfile.setSubRole(subRoleToAssign);

        userProfileRepository.save(userProfile);
    }

    private void updateUserRoleBasedOnPlan(UserProfile userProfile, SubscriptionPlanDTO.PlanName planName) {
        Role roleToAssign =
                switch (planName) {
                    case ENTERPRISE -> roleRepository
                            .findByName(DoctorRole.ENTERPRISE_COMPANY_LAB.name())
                            .orElseThrow(() -> new GenericException("ENTERPRISE_COMPANY_LAB role not found"));
                    case GROWTH -> roleRepository
                            .findByName(DoctorRole.IN_OFFICE_MANUFACTURER.name())
                            .orElseThrow(() -> new GenericException("IN_OFFICE_MANUFACTURER role not found"));
                    default -> roleRepository
                            .findByName(DoctorRole.PRACTICE.name())
                            .orElseThrow(() -> new GenericException("PRACTICE role not found"));
                };

        userProfile.getRoles().clear();
        userProfile.getRoles().add(roleToAssign);

        userProfileRepository.save(userProfile);
    }

    private void updateBasicPlanInfo(SubscriptionPlan subscriptionPlan, UpgradeSubscription request) {

        if (request.getTotalPatients() != null) {
            subscriptionPlan.setTotalPatients(request.getTotalPatients());
        }

        if (request.getTotalStorageGb() != null) {
            subscriptionPlan.setTotalStorageGb(request.getTotalStorageGb());
        }

        if (request.getTotalUsers() != null) {
            subscriptionPlan.setTotalUsers(request.getTotalUsers());
        }

        if (request.getTotalOrders() != null) {
            subscriptionPlan.setTotalOrders(request.getTotalOrders());
        }
    }

    private void updatePlanMetadata(SubscriptionPlan subscriptionPlan, UpgradeSubscription request) {
        SubscriptionPlanDTO.PlanMetadata currentMetadata = subscriptionPlan.getPlanMetadata();
        SubscriptionPlanDTO.PlanMetadata newMetadata;

        newMetadata = SubscriptionPlanDTO.PlanMetadata.builder()
                .status(currentMetadata.getStatus())
                .planName(request.getPlanName())
                .planType(request.getPlanType())
                .isTrialPlan(request.getIsTrial())
                .nextBillingAt(request.getNextBillingAt())
                .currentTermEnd(request.getCurrentTermEnd())
                .currentTermStart(request.getCurrentTermStart())
                .build();

        subscriptionPlan.setPlanMetadata(newMetadata);
    }

    private void updateCounts(SubscriptionPlan subscriptionPlan, UpgradeSubscription request) {
        int patientCount = getPatientCountForPlan(request.getPlanName());
        subscriptionPlan.setTotalPatients(patientCount);

        int orderCount = getOrderCountForPlan(request.getPlanName());
        subscriptionPlan.setTotalOrders(orderCount);

        int userCount = getUserCountForPlan(request.getPlanName());
        subscriptionPlan.setTotalUsers(userCount);

        double storageGb = getStorageForPlan(request.getPlanName());
        subscriptionPlan.setTotalStorageGb(storageGb);
    }

    private int getPatientCountForPlan(SubscriptionPlanDTO.PlanName planName) {
        return switch (planName) {
            case GROWTH, ENTERPRISE -> 100;
            case PROFESSIONAL -> 500;
            default -> 50;
        };
    }

    private int getOrderCountForPlan(SubscriptionPlanDTO.PlanName planName) {
        return switch (planName) {
            case GROWTH -> 50;
            case ENTERPRISE -> 500;
            case STARTER -> 20;
            case PROFESSIONAL -> 200;
            default -> 10;
        };
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSubscriptionActive(Long doctorId, Long userProfileId) {
        if (doctorId == null || userProfileId == null) {
            return false;
        }

        SubscriptionUserMapping subscriptionUserMapping =
                subscriptionUserMappingRepository.findByDoctorIdAndUserProfileIdWithSubscriptionPlan(
                        userProfileId, doctorId);

        if (subscriptionUserMapping == null
                || subscriptionUserMapping.getSubscriptionPlan() == null
                || subscriptionUserMapping.getSubscriptionPlan().getPlanMetadata() == null) {
            return false;
        }

        return subscriptionUserMapping.getSubscriptionPlan().getPlanMetadata().getStatus()
                == SubscriptionPlanDTO.PlanStatus.ACTIVE;
    }

    private int getUserCountForPlan(SubscriptionPlanDTO.PlanName planName) {
        return switch (planName) {
            case GROWTH -> 5;
            case ENTERPRISE -> 50;
            case STARTER -> 2;
            case PROFESSIONAL -> 10;
            default -> 1;
        };
    }

    private double getStorageForPlan(SubscriptionPlanDTO.PlanName planName) {
        return switch (planName) {
            case GROWTH, ENTERPRISE -> 10.0;
            case STARTER, PROFESSIONAL -> 5.0;
            default -> 1.0;
        };
    }

    @Override
    @Transactional(readOnly = true)
    public OrgWhatsAppDetails isWhatsAppMessagingEnabled(Long doctorId, Long userProfileId) {
        OrgWhatsAppDetails details = new OrgWhatsAppDetails();

        userProfileRepository
                .findById(userProfileId)
                .map(UserProfile::getOrganizationBrandName)
                .map(ResolveOrgName::resolveOrgName)
                .ifPresent(details::setOrgName);

        SubscriptionUserMapping subscriptionUserMapping =
                subscriptionUserMappingRepository.findByDoctorIdAndUserProfileIdWithSubscriptionPlan(
                        userProfileId, doctorId);

        boolean isEnabled = false;
        if (subscriptionUserMapping != null && subscriptionUserMapping.getSubscriptionPlan() != null) {
            isEnabled = Boolean.TRUE.equals(
                    subscriptionUserMapping.getSubscriptionPlan().getIsWhatsAppMessagingEnabled());
        }

        details.setWhatsAppMessagingEnabled(isEnabled);

        return details;
    }

    @Override
    @Transactional
    public void toggleIsDemoCompleted(Long profileId, Long doctorId) {
        SubscriptionUserMapping subscriptionUserMapping =
                subscriptionUserMappingRepository.findByDoctorIdAndUserProfileIdWithSubscriptionPlan(
                        profileId, doctorId);

        if (subscriptionUserMapping != null) {
            SubscriptionPlan subscriptionPlan = subscriptionUserMapping.getSubscriptionPlan();
            if (subscriptionPlan != null) {
                Boolean currentDemoStatus = subscriptionPlan.getIsDemoCompleted();
                subscriptionPlan.setIsDemoCompleted(currentDemoStatus == null || !currentDemoStatus);
                subscriptionRepository.save(subscriptionPlan);
            }
        }
    }

    @Override
    public String getWhatsAppDetails(Long doctorId) {
        if (whatsAppUtilities.isCustomerByDoctorId(doctorId)) {
            return userProfileRepository.findOrganizationBrandNameByDoctorId(doctorId);
        }
        return null;
    }

    public String formatPlanName(String originalPlanName) {
        if (originalPlanName == null) return null;

        return Arrays.stream(originalPlanName.split("_"))
                .map(word ->
                        word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    public String formatPlanForDisplay(String planName) {
        if (planName == null) return null;

        return switch (planName.toUpperCase()) {
            case "STARTER" -> "Starter Plan";
            case "GROWTH" -> "Growth Plan";
            case "PROFESSIONAL" -> "Professional Plan";
            case "DESIGN_LAB" -> "Design lab";
            default -> planName;
        };
    }

    public String upgradePlan(String requestType, String planName) {
        String formattedPlanName = formatPlanForDisplay(planName);
        return requestType + " - " + formattedPlanName;
    }
}
