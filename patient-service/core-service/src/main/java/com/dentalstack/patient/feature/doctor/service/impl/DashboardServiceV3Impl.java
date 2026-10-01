package com.dentalstack.patient.feature.doctor.service.impl;

import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.*;

import com.dentalstack.patient.feature.aligner.dto.analytics.ChartCountForAnalyticsRequest;
import com.dentalstack.patient.feature.aligner.projection.AlignerAnalyticsCounts;
import com.dentalstack.patient.feature.aligner.projection.PatientDueStatusCounts;
import com.dentalstack.patient.feature.aligner.repository.AlignerAnalyticsQueryRepository;
import com.dentalstack.patient.feature.aligner.repository.action.AlignerActionRepository;
import com.dentalstack.patient.feature.aligner.service.AlignerAnalyticsService;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.chat.repository.ChatParticipantRepository;
import com.dentalstack.patient.feature.chat.repository.DoctorChatRepository;
import com.dentalstack.patient.feature.dashboardlabel.repository.DashboardLabelRepository;
import com.dentalstack.patient.feature.doctor.dto.*;
import com.dentalstack.patient.feature.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.projection.PlanningPracticeCounts;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.doctor.service.DashboardServiceV3;
import com.dentalstack.patient.feature.doctor.service.DoctorDashboardService;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.doctor.util.DashboardGrowthMetricsUtil;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountRequest;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationRole;
import com.dentalstack.patient.feature.doctorinvitation.repository.DoctorInvitationRepository;
import com.dentalstack.patient.feature.invitation.projection.InvitationCountsProjection;
import com.dentalstack.patient.feature.order.dto.OrdersCountResponse;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.repository.ManufacturingRepository;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.order.repository.PatientsOrderDetailsRepository;
import com.dentalstack.patient.feature.order.service.OrderResponseService;
import com.dentalstack.patient.feature.patient.dto.ActivePatientRequestV2;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.feature.patient.enums.PatientType;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientListCountRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.patient.service.PatientListService;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.subcription.enums.PlanName;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.vsp.repository.VspOrderRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.LabelCountResponse;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.WorkflowKanbanSummaryResponse;
import com.dentalstack.patient.feature.workflow.core.workflows.projection.AssigneeDistributionProjection;
import com.dentalstack.patient.feature.workflow.core.workflows.service.KanbanService;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.utils.InternalUserProfileUtil;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class DashboardServiceV3Impl implements DashboardServiceV3 {

    private final OrderResponseService orderResponseService;
    private final OrderRepository orderRepository;
    private final DoctorInvitationRepository doctorInvitationRepository;
    private final PatientListCountRepository patientListCountRepository;
    private final ManufacturingRepository manufacturingRepository;

    private final TreatmentPlanRepository treatmentPlanRepository;
    private final ReminderRepository reminderRepository;
    private final PatientListService patientListService;
    private final AlignerActionRepository alignerActionRepository;
    private final DoctorDashboardService doctorDashboardService;
    private final AlignerAnalyticsQueryRepository alignerAnalyticsQueryRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final DoctorService doctorService;
    private final UserProfileRepository userProfileRepository;
    private final DashboardLabelRepository dashboardLabelRepository;
    private final KanbanService kanbanService;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final PatientRepository patientRepository;
    private final AlignerAnalyticsService alignerAnalyticsService;
    private final BracesJourneyRepository bracesJourneyRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;
    private final PatientsOrderDetailsRepository patientsOrderDetailsRepository;
    private final ChatParticipantRepository participantRepository;
    private final TimelineService timelineService;
    private final VspOrderRepository vspOrderRepository;
    private final DoctorChatRepository doctorChatRepository;
    private final Executor dashboardExecutor;
    private static final String NEW_CASE_WORKFLOW = "New Case";

    public DashboardServiceV3Impl(
            OrderResponseService orderResponseService,
            OrderRepository orderRepository,
            DoctorInvitationRepository doctorInvitationRepository,
            PatientListCountRepository patientListCountRepository,
            ManufacturingRepository manufacturingRepository,
            TreatmentPlanRepository treatmentPlanRepository,
            ReminderRepository reminderRepository,
            PatientListService patientListService,
            AlignerActionRepository alignerActionRepository,
            DoctorDashboardService doctorDashboardService,
            AlignerAnalyticsQueryRepository alignerAnalyticsQueryRepository,
            PatientDoctorOrganizationRepository patientDoctorOrganizationRepository,
            DoctorService doctorService,
            UserProfileRepository userProfileRepository,
            DashboardLabelRepository dashboardLabelRepository,
            KanbanService kanbanService,
            PatientTaskTrackerRepository patientTaskTrackerRepository,
            PatientRepository patientRepository,
            AlignerAnalyticsService alignerAnalyticsService,
            BracesJourneyRepository bracesJourneyRepository,
            ServiceConfigurationRepository serviceConfigurationRepository,
            CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository,
            PatientsOrderDetailsRepository patientsOrderDetailsRepository,
            ChatParticipantRepository participantRepository,
            TimelineService timelineService,
            VspOrderRepository vspOrderRepository,
            DoctorChatRepository doctorChatRepository,
            @Qualifier("dashboardExecutor") Executor dashboardExecutor) {
        this.orderResponseService = orderResponseService;
        this.orderRepository = orderRepository;
        this.doctorInvitationRepository = doctorInvitationRepository;
        this.patientListCountRepository = patientListCountRepository;
        this.manufacturingRepository = manufacturingRepository;
        this.treatmentPlanRepository = treatmentPlanRepository;
        this.reminderRepository = reminderRepository;
        this.patientListService = patientListService;
        this.alignerActionRepository = alignerActionRepository;
        this.doctorDashboardService = doctorDashboardService;
        this.alignerAnalyticsQueryRepository = alignerAnalyticsQueryRepository;
        this.patientDoctorOrganizationRepository = patientDoctorOrganizationRepository;
        this.doctorService = doctorService;
        this.userProfileRepository = userProfileRepository;
        this.dashboardLabelRepository = dashboardLabelRepository;
        this.kanbanService = kanbanService;
        this.patientTaskTrackerRepository = patientTaskTrackerRepository;
        this.patientRepository = patientRepository;
        this.alignerAnalyticsService = alignerAnalyticsService;
        this.bracesJourneyRepository = bracesJourneyRepository;
        this.serviceConfigurationRepository = serviceConfigurationRepository;
        this.customerAccessAndRevokeRepository = customerAccessAndRevokeRepository;
        this.patientsOrderDetailsRepository = patientsOrderDetailsRepository;
        this.participantRepository = participantRepository;
        this.timelineService = timelineService;
        this.vspOrderRepository = vspOrderRepository;
        this.doctorChatRepository = doctorChatRepository;
        this.dashboardExecutor = dashboardExecutor;
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDashboardResponseV3 getDoctorDashboardData(DoctorDashboardRequest request) {

        PlanName planName = request.getPlanName();

        DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder =
                DoctorDashboardResponseV3.DashboardDetails.builder();

        switch (planName) {
            case STARTER, LITE:
                getStarterPlanDashboardDetails(request, dashboardDetailsBuilder);
                break;

            case GROWTH:
                getGrowthPlanDashboardDetails(request, dashboardDetailsBuilder);
                break;

            case PROFESSIONAL:
                getProfessionalPlanDashboardDetails(request, dashboardDetailsBuilder);
                break;

            case ENTERPRISE:
                getEnterprisePlanDashboardDetails(request, dashboardDetailsBuilder);
                break;

            case DESIGN_LAB:
                getDesignLabDashboardDetails(request, dashboardDetailsBuilder);
                break;

            case LAB_STAFF:
                getLabStaffDashboardDetails(request, dashboardDetailsBuilder);
                break;

            case ENTERPRISE_LAB_STAFF:
                getEnterpriseLabStaffDashboardDetails(request, dashboardDetailsBuilder);
                break;

            case VENDOR:
                getVendorPlanDashboardDetails(request, dashboardDetailsBuilder);
                break;

            case CUSTOMER:
                getCustomerDashboardDetails(request, dashboardDetailsBuilder);
                break;

            case PRACTICE_CONNECTED_ORG:
                getPracticeConnectedOrDashboardDetails(request, dashboardDetailsBuilder);
                break;

            case INTERNAL_USER:
                getInternalUserDashboardDetails(request, dashboardDetailsBuilder);
                break;

            default:
                break;
        }
        return DoctorDashboardResponseV3.builder()
                .dashboardDetails(dashboardDetailsBuilder.build())
                .build();
    }

    @Override
    public DoctorDashboardResponseV4 getDoctorDashboardDataV4(DoctorDashboardRequest request) {

        PlanName planName = request.getPlanName();
        DoctorDashboardResponseV4.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder =
                DoctorDashboardResponseV4.DashboardDetails.builder();

        List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(request.getProfileId());

        Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                        request.getProfileId(), request.getOrganizationId());
        customerAccessAndRevoke.ifPresent(c -> {
            dashboardDetailsBuilder.isCustomerTrackingEnabled(c.getIsTrackingEnabled());
            dashboardDetailsBuilder.isCustomerStlFileViewEnabled(c.getIsStlFileViewEnabled());
            dashboardDetailsBuilder.isCustomerScanFileViewEnabled(c.getIsScanFileViewEnabled());
            dashboardDetailsBuilder.isCustomerPrintFileViewEnabled(c.getIsPrintFileViewEnabled());
        });
        switch (planName) {
            case STARTER, LITE:
                getStarterPlanDashboardDetailsV4(request, dashboardDetailsBuilder);
                break;

            case GROWTH:
                getGrowthPlanDashboardDetailsV4(request, dashboardDetailsBuilder);
                break;

            case PRACTICE_CONNECTED_ORG:
                if (enabledItems.stream().anyMatch("PLANNING"::equals)) {
                    getPracticePlaningDashboardV4(request, dashboardDetailsBuilder);
                } else {
                    getPracticeConnectedOrDashboardDetailsV4(request, dashboardDetailsBuilder);
                }
                break;

            case PRACTICE_CONNECTED_TO_VSP_ORG:
                getVspCustomerDashboardV4(request, dashboardDetailsBuilder);
                break;

            case ENTERPRISE:
                var userProfile = userProfileRepository
                        .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                        .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

                var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

                if (isAdminWithDefaultTag && userProfile.getInviterProfile() != null) {
                    var inviterProfile = userProfile.getInviterProfile();
                    request.setProfileId(inviterProfile.getId());
                }

                if (enabledItems.stream().anyMatch("MANUFACTURING"::equals)) {
                    getEnterpriseManufacturingUserDashboardDetailsV4(request, dashboardDetailsBuilder);
                } else if (enabledItems.stream().anyMatch("PLANNING"::equals)) {
                    getEnterprisePlanningUserDashboardDetailsV4(request, dashboardDetailsBuilder);
                } else {
                    getEnterprisePlanDashboardDetailsV4(request, dashboardDetailsBuilder);
                }
                break;

            case INTERNAL_USER:
                getCustomInternalUserPlanDashboardDetailsV4(request, dashboardDetailsBuilder);
                break;

            case PLANNING:
                getEnterprisePlanningUserDashboardDetailsV4(request, dashboardDetailsBuilder);
                break;

            case MANUFACTURING:
                getEnterpriseManufacturingUserDashboardDetailsV4(request, dashboardDetailsBuilder);
                break;

            default:
                break;
        }
        return DoctorDashboardResponseV4.builder()
                .dashboardDetails(dashboardDetailsBuilder.build())
                .build();
    }

    private void getVspCustomerDashboardV4(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV4.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {
        Long profileId = request.getProfileId();

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        var unreadNotification = timelineService.getTotalActiveEventCount(request.getDoctorId(), userProfile);

        PlanningPracticeCounts counts = vspOrderRepository.getVspPlanningPracticeCounts(profileId);

        var unreadMessageCount = participantRepository.countTotalUnreadMessages(profileId);
        DoctorDashboardResponseV4.PlanningPractice.PlanningCounts planningCounts =
                DoctorDashboardResponseV4.PlanningPractice.PlanningCounts.builder()
                        .active(counts.getActive())
                        .draft(counts.getDraft())
                        .needInfo(counts.getNeedInfo())
                        .inProgress(counts.getInProgress())
                        .inReview(counts.getInReview())
                        .inRevision(counts.getInRevision())
                        .approved(counts.getApproved())
                        .completed(counts.getCompleted())
                        .casesThisMonth(counts.getCasesThisMonth())
                        .casesLastMonth(counts.getCasesLastMonth())
                        .lastActivityDate(counts.getLastActivityDate())
                        .totalUnreadChatCount(unreadMessageCount)
                        .unreadNotificationCount(unreadNotification)
                        .build();

        dashboardDetailsBuilder.vspCustomer(DoctorDashboardResponseV4.PlanningPractice.builder()
                .counts(planningCounts)
                .build());
    }

    private void getPracticePlaningDashboardV4(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV4.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {

        Long profileId = request.getProfileId();

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        var unreadNotification = timelineService.getTotalActiveEventCount(request.getDoctorId(), userProfile);

        PlanningPracticeCounts counts = orderRepository.getPlanningPracticeCounts(profileId);

        var unreadMessageCount = participantRepository.countTotalUnreadMessages(profileId);
        DoctorDashboardResponseV4.PlanningPractice.PlanningCounts planningCounts =
                DoctorDashboardResponseV4.PlanningPractice.PlanningCounts.builder()
                        .active(counts.getActive())
                        .draft(counts.getDraft())
                        .needInfo(counts.getNeedInfo())
                        .inProgress(counts.getInProgress())
                        .inReview(counts.getInReview())
                        .inRevision(counts.getInRevision())
                        .approved(counts.getApproved())
                        .completed(counts.getCompleted())
                        .casesThisMonth(counts.getCasesThisMonth())
                        .casesLastMonth(counts.getCasesLastMonth())
                        .lastActivityDate(counts.getLastActivityDate())
                        .totalUnreadChatCount(unreadMessageCount)
                        .unreadNotificationCount(unreadNotification)
                        .build();

        dashboardDetailsBuilder.planningPractice(DoctorDashboardResponseV4.PlanningPractice.builder()
                .counts(planningCounts)
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public MiniDashboardDetailsResponse getMiniDashboardDetails(MiniDashboardRequest request) {
        var ownerProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var customerProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getCustomerProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getCustomerProfileId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && ownerProfile.getInviterProfile() != null) {
            ownerProfile = ownerProfile.getInviterProfile();
            request.setProfileId(ownerProfile.getId());
        }

        List<Long> internalUserProfileIds =
                new ArrayList<>(InternalUserProfileUtil.getInternalUserProfileIds(ownerProfile, userProfileRepository));
        if (ownerProfile.getSubRole() != null && ownerProfile.isEnterpriseOrDesignLab()) {
            internalUserProfileIds =
                    userProfileRepository.findInvitedInternalUserProfileIdsByInviter(ownerProfile.getId());
        }
        internalUserProfileIds.add(ownerProfile.getId());

        Long sentOrderCount =
                patientsOrderDetailsRepository.sentOrderCount(internalUserProfileIds, request.getCustomerProfileId());
        var lastOrderDate =
                patientsOrderDetailsRepository.getLastOrderDate(internalUserProfileIds, request.getCustomerProfileId());

        Long receivedOrderCount = patientsOrderDetailsRepository.receivedOrderCount(
                internalUserProfileIds, request.getCustomerProfileId());

        var totalPatientCount = patientDoctorOrganizationRepository.getCustomerPatientCount(
                request.getCustomerProfileId(),
                request.getProfileId(),
                customerProfile.getDoctor().getId());

        Long totalOrder = sentOrderCount + receivedOrderCount;

        Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                        request.getCustomerProfileId(),
                        ownerProfile.getOrganization().getId());
        MiniDashboardDetailsResponse response = MiniDashboardDetailsResponse.builder()
                .lastOrderAt(lastOrderDate)
                .totalCustomerOrders(totalOrder)
                .totalPatients(totalPatientCount)
                .build();

        customerAccessAndRevoke.ifPresent(c -> {
            response.setCustomerTrackingEnabled(c.getIsTrackingEnabled());
            response.setCustomerStlFileViewEnabled(c.getIsStlFileViewEnabled());
            response.setCustomerPrintFileViewEnabled(c.getIsPrintFileViewEnabled());
            response.setCustomerScanFileViewEnabled(c.getIsScanFileViewEnabled());
        });

        return response;
    }

    private void getInternalUserDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {

        var profileId = request.getProfileId();
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        if (!ProfileType.INVITED.equals(userProfile.getProfileType()) || userProfile.getInviterProfile() == null) {
            return;
        }

        var inviterUserId = userProfile.getInviterProfile().getId();
        var inviterUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(inviterUserId)
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        var roles = inviterUserProfile.getRoles();
        request.setProfileId(inviterUserId);
        request.setDoctorId(inviterUserProfile.getDoctor().getId());
        request.setOrganizationId(inviterUserProfile.getOrganization().getId());

        if (isEnterprisePlanUser(roles)) {
            getEnterprisePlanDashboardDetails(request, dashboardDetailsBuilder);
        } else if (isProfessionalPlanUser(roles)) {

            getProfessionalPlanDashboardDetails(request, dashboardDetailsBuilder);

        } else if (isDesignLabPlanUser(roles)) {
            getDesignLabDashboardDetails(request, dashboardDetailsBuilder);
        }
    }

    private boolean isEnterprisePlanUser(Set<Role> roles) {
        return hasRole(roles, DoctorRole.ENTERPRISE_COMPANY_LAB.name());
    }

    private boolean isProfessionalPlanUser(Set<Role> roles) {
        return hasRole(roles, DoctorRole.ALIGNER_COMPANY_OR_LAB.name());
    }

    private boolean isDesignLabPlanUser(Set<Role> roles) {
        return hasRole(roles, DoctorRole.COMMERCIAL_ALIGNER_LAB.name());
    }

    private boolean hasRole(Set<Role> roles, String roleName) {
        return roles.stream().map(Role::getName).anyMatch(roleName::equals);
    }

    private void getEnterpriseLabStaffDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {
        long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();
        OrdersCountResponse practiceOrder = orderResponseService.getLabStaffOrderResponse(
                doctorId, organizationId, profileId, List.of(DoctorRole.CONSULTING_ORTHODONTIST.name()));
        OrdersCountResponse customerOrders = orderResponseService.getLabStaffOrderResponse(
                doctorId, organizationId, profileId, List.of(DoctorRole.CUSTOMER.name()));

        dashboardDetailsBuilder.enterpriseLabStaff(DoctorDashboardResponseV3.EnterpriseLabStaff.builder()
                .practiceOrder(DoctorDashboardResponseV3.EnterpriseLabPracticeOrder.practiceOrder(practiceOrder))
                .customerOrders(DoctorDashboardResponseV3.EnterpriseLabCustomerOrders.customerOrders(customerOrders))
                .build());
    }

    private void getPracticeConnectedOrDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {

        long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();
        OrdersCountResponse sentOrdersCount =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, true, null);

        var manufacturingCounts = manufacturingRepository.countManufacturingBatchesByTargetProfile(profileId);
        var countExistingPatientsWithUnreadForm =
                patientDoctorOrganizationRepository.countExistingPatientsWithUnreadForm(profileId);

        AlignerAnalyticsCounts alignerAnalyticsCounts =
                alignerAnalyticsQueryRepository.getAlignerAnalyticsCountsByPractice(organizationId, profileId);

        var patientCountResponse = patientListService.getPatientCount(ActivePatientRequestV2.builder()
                .doctorId(doctorId)
                .organizationId(organizationId)
                .profileId(profileId)
                .filterByAppInviteStatus(AppInviteStatus.ALL)
                .patientType(PatientType.ALL)
                .doctorRole(DoctorRole.CONSULTING_ORTHODONTIST)
                .build());

        var pendingPatientsWithoutBatches = treatmentPlanRepository.countOfManufacturingPendingForPractice(
                request.getProfileId(),
                ManufacturingStatus.MANUFACTURING_PENDING,
                ManufacturingStatus.MANUFACTURING_PENDING.name());

        LocalDate today = LocalDate.now();
        Integer todayAppointments = reminderRepository.countByDoctorAndDateAndStatusesAndPurpose(
                profileId,
                today,
                List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED),
                ReminderPurpose.APPOINTMENT);
        var alignerUpdateCounts = alignerActionRepository.getTotalUnvalidatedActionsForProfile(
                request.getDoctorId(), request.getOrganizationId(), request.getProfileId());
        dashboardDetailsBuilder.practiceConnectedToOrg(DoctorDashboardResponseV3.PracticeConnectedToOrg.builder()
                .patientsSummary(DoctorDashboardResponseV3.PatientsSummaryExtended.from(patientCountResponse))
                .manufacturingStatus(DoctorDashboardResponseV3.ManufacturingStatus.from(
                        manufacturingCounts, pendingPatientsWithoutBatches))
                .planningStatus(DoctorDashboardResponseV3.Planning.from(sentOrdersCount))
                .myTasks(DoctorDashboardResponseV3.MyTasksExtended.from(
                        alignerUpdateCounts,
                        todayAppointments,
                        patientCountResponse,
                        sentOrdersCount,
                        manufacturingCounts,
                        countExistingPatientsWithUnreadForm))
                .patientCompliance(DoctorDashboardResponseV3.PatientCompliance.from(alignerAnalyticsCounts))
                .build());
    }

    private void getCustomerDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {
        long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();
        OrdersCountResponse sentOrders =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, true, null);
        dashboardDetailsBuilder.thirdPartyCustomer(DoctorDashboardResponseV3.ThirdPartyCustomer.builder()
                .orders(DoctorDashboardResponseV3.Orders.from(sentOrders.getCount()))
                .myTasks(DoctorDashboardResponseV3.ProfessionalPlanCustomerViewMyTask.from(sentOrders))
                .build());
    }

    private void getVendorPlanDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {
        Long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();
        OrdersCountResponse receivedOrderCount =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, false, null);
        var growthMetrics = calculateGrowthMetrics(profileId);
        Double receivedGrowth = growthMetrics.receivedGrowth();
        DoctorInvitationCountDetails doctorInvitationCount = doctorService.getInvitationCountOfAllRoles(
                DoctorInvitationCountRequest.from(doctorId, organizationId, profileId, true));
        dashboardDetailsBuilder.thirdPartyLab(DoctorDashboardResponseV3.ThirdPartyLab.from(
                receivedOrderCount, receivedGrowth, doctorInvitationCount));
    }

    private void getLabStaffDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {
        Long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();
        OrdersCountResponse receivedOrderCount =
                orderResponseService.getLabStaffOrderResponse(doctorId, organizationId, profileId, null);
        var growthMetrics = calculateGrowthMetrics(profileId);
        Double receivedGrowth = growthMetrics.receivedGrowth();
        DoctorInvitationCountDetails doctorInvitationCount = doctorService.getInvitationCountOfAllRoles(
                DoctorInvitationCountRequest.from(doctorId, organizationId, profileId, true));
        dashboardDetailsBuilder.thirdPartyLab(DoctorDashboardResponseV3.ThirdPartyLab.from(
                receivedOrderCount, receivedGrowth, doctorInvitationCount));
    }

    private void getDesignLabDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {

        Long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();
        OrdersCountResponse receivedOrderCount =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, false, null);
        OrdersCountResponse assignedOrders =
                orderResponseService.getAssignedOrdersCountToLabs(doctorId, organizationId, profileId);
        var growthMetrics = calculateGrowthMetrics(profileId);
        Double receivedGrowth = growthMetrics.receivedGrowth();
        DoctorInvitationCountDetails doctorInvitationCount = doctorService.getInvitationCountOfAllRoles(
                DoctorInvitationCountRequest.from(doctorId, organizationId, profileId, true));
        dashboardDetailsBuilder.designLab(DoctorDashboardResponseV3.DesignLab.from(
                receivedOrderCount, receivedGrowth, doctorInvitationCount, assignedOrders));
    }

    private void getGrowthPlanDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {

        long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();
        OrdersCountResponse sentOrders =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, true, null);
        var growthMetrics = calculateGrowthMetrics(profileId);

        var totalPatientsCount = patientListCountRepository
                .getPatientCountForOrg(
                        organizationId,
                        null,
                        null,
                        null,
                        PatientType.ALL.name(),
                        List.of(
                                DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                DoctorRole.VENDOR.name(),
                                DoctorRole.LAB_STAFF.name(),
                                DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                                DoctorRole.IN_OFFICE_MANUFACTURER.name()))
                .intValue();

        DoctorDashboardCount dashboardCount =
                doctorDashboardService.getDashboardCount(doctorId, organizationId, profileId);

        var alignerUpdateCounts = alignerActionRepository.getTotalUnvalidatedActionsForProfile(
                request.getDoctorId(), request.getOrganizationId(), request.getProfileId());
        LocalDate today = LocalDate.now();
        Integer todayAppointments = reminderRepository.countByDoctorAndDateAndStatusesAndPurpose(
                profileId,
                today,
                List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED),
                ReminderPurpose.APPOINTMENT);

        var workSpace = DoctorDashboardResponseV3.Workspace.from(
                dashboardCount, alignerUpdateCounts, todayAppointments, sentOrders);

        var customerView = DoctorDashboardResponseV3.CustomerView.from(sentOrders);
        var labelName = buildLabels(request.getProfileId(), false);
        dashboardDetailsBuilder.labelName(labelName);
        dashboardDetailsBuilder.growthPlan(DoctorDashboardResponseV3.GrowthPlan.builder()
                .workspace(workSpace)
                .customerView(customerView)
                .home(DoctorDashboardResponseV3.GrowthHome.from(
                        sentOrders, growthMetrics.sentGrowth, totalPatientsCount, workSpace, customerView))
                .build());
    }

    private void getStarterPlanDashboardDetailsV4(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV4.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {
        long doctorId = request.getDoctorId();
        long organizationId = request.getOrganizationId();
        long profileId = request.getProfileId();

        var userProfileFuture = CompletableFuture.supplyAsync(
                () -> userProfileRepository
                        .findByIdWithOrgAndDoctorAndUseWithInviterRoles(profileId)
                        .orElseThrow(() -> new DoctorNotFoundException(doctorId)),
                dashboardExecutor);
        var alignerCountFuture = CompletableFuture.supplyAsync(
                () -> patientDoctorOrganizationRepository.countAllPatientBasedOnProductType(
                        profileId, ProductTypeName.ALIGNERS),
                dashboardExecutor);
        var bracesCountFuture = CompletableFuture.supplyAsync(
                () -> patientDoctorOrganizationRepository.countAllPatientBasedOnProductType(
                        profileId, ProductTypeName.BRACES),
                dashboardExecutor);
        var bracesIdsFuture = CompletableFuture.supplyAsync(
                () -> patientDoctorOrganizationRepository.findPatientIdsByUserProfileIdAndProductType(
                        profileId, ProductTypeName.BRACES),
                dashboardExecutor);
        var patientCountFuture = CompletableFuture.supplyAsync(
                () -> patientListService.getAllPatientsByStages(ActivePatientRequestV2.builder()
                        .doctorId(doctorId)
                        .organizationId(organizationId)
                        .profileId(profileId)
                        .filterByAppInviteStatus(AppInviteStatus.ALL)
                        .patientType(PatientType.ALL)
                        .doctorRole(DoctorRole.IN_OFFICE_MANUFACTURER)
                        .isPatientCountRequest(true)
                        .build()),
                dashboardExecutor);
        var alignerAnalyticsFuture = CompletableFuture.supplyAsync(
                () -> alignerAnalyticsQueryRepository.getAlignerAnalyticsCountsByOrg(organizationId),
                dashboardExecutor);
        var chartCountFuture = CompletableFuture.supplyAsync(
                () -> alignerAnalyticsService.getChartCountData(ChartCountForAnalyticsRequest.builder()
                        .doctorId(doctorId)
                        .organizationId(organizationId)
                        .profileId(profileId)
                        .build()),
                dashboardExecutor);
        var appInviteFuture = CompletableFuture.supplyAsync(
                () -> patientRepository.getAppInviteStatusCountsByOrganization(
                        organizationId, List.of(DoctorRole.CONSULTING_ORTHODONTIST.name())),
                dashboardExecutor);

        CompletableFuture.allOf(
                        userProfileFuture,
                        alignerCountFuture,
                        bracesCountFuture,
                        bracesIdsFuture,
                        patientCountFuture,
                        alignerAnalyticsFuture,
                        chartCountFuture,
                        appInviteFuture)
                .join();

        var userProfile = userProfileFuture.join();
        Long alignerPatientCount = alignerCountFuture.join();
        Long bracesPatientCount = bracesCountFuture.join();
        List<Long> bracesPatientIds = bracesIdsFuture.join();
        var patientCountResponse = patientCountFuture.join();
        var alignerAnalyticsCounts = alignerAnalyticsFuture.join();
        var alignerAnalyticsCountResponse = chartCountFuture.join();
        var appInviteStatusCount = appInviteFuture.join();

        long appointmentNotesCount = 0L;
        if (!bracesPatientIds.isEmpty()) {
            appointmentNotesCount = Optional.ofNullable(
                            bracesJourneyRepository.countNotesForPatientIds(bracesPatientIds))
                    .orElse(0L);
        }

        var unreadNotification = timelineService.getTotalActiveEventCount(doctorId, userProfile);

        var patientsSummary = DoctorDashboardResponseV4.StarterPatientsSummary.from(
                patientCountResponse, alignerPatientCount, bracesPatientCount);
        var patientCompliance = DoctorDashboardResponseV4.PatientCompliance.from(alignerAnalyticsCounts);
        var pendingInvitationCount = appInviteStatusCount.getPendingCount();

        dashboardDetailsBuilder.starterPlan(DoctorDashboardResponseV4.StarterPlan.builder()
                .patientsSummary(patientsSummary)
                .coreTask(DoctorDashboardResponseV4.StaterPlanCoreTask.builder()
                        .addAppointmentNotes(appointmentNotesCount)
                        .invitationPending(pendingInvitationCount)
                        .needsAttention(patientCompliance.getNeedsAttention())
                        .atRisk(patientCompliance.getAtRisk())
                        .alignerChangeAndCheckin(alignerAnalyticsCountResponse.getUniquePatientWithActionCounts())
                        .build())
                .unreadNotificationCount(unreadNotification)
                .build());
    }

    private void getGrowthPlanDashboardDetailsV4(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV4.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {
        long doctorId = request.getDoctorId();
        long organizationId = request.getOrganizationId();
        long profileId = request.getProfileId();

        List<String> newCaseWorkflowNames = List.of(NEW_CASE_WORKFLOW);
        List<String> planningWorkflowNames = Arrays.asList(PLANNING_IN_HOUSE_WORKFLOW, PLAN_OUTSOURCED_WORKFLOW);
        List<String> productionWorkflowNames =
                Arrays.asList(PRODUCTION_IN_HOUSE_WORKFLOW, PRODUCTION_OUTSOURCE_WORKFLOW);
        List<String> allCombined = Arrays.asList(
                NEW_CASE_WORKFLOW,
                PLANNING_IN_HOUSE_WORKFLOW,
                PLAN_OUTSOURCED_WORKFLOW,
                PRODUCTION_IN_HOUSE_WORKFLOW,
                PRODUCTION_OUTSOURCE_WORKFLOW);

        var kanbanFuture = CompletableFuture.supplyAsync(
                () -> kanbanService.getWorkflowKanbanSummaryByProfile(profileId), dashboardExecutor);
        var dueFuture = CompletableFuture.supplyAsync(
                () -> patientDoctorOrganizationRepository.getPatientDueStatusCountsByOrgForUnprocessedAligner(
                        organizationId),
                dashboardExecutor);
        var userProfileFuture = CompletableFuture.supplyAsync(
                () -> userProfileRepository
                        .findByIdWithOrgAndDoctorAndUseWithInviterRoles(profileId)
                        .orElseThrow(() -> new DoctorNotFoundException(doctorId)),
                dashboardExecutor);
        var newCaseAssigneeFuture = CompletableFuture.supplyAsync(
                () -> getAssigneeDistribution(profileId, newCaseWorkflowNames), dashboardExecutor);
        var productionAssigneeFuture = CompletableFuture.supplyAsync(
                () -> getAssigneeDistribution(profileId, productionWorkflowNames), dashboardExecutor);
        var planningAssigneeFuture = CompletableFuture.supplyAsync(
                () -> getAssigneeDistribution(profileId, planningWorkflowNames), dashboardExecutor);
        var allAssigneeFuture =
                CompletableFuture.supplyAsync(() -> getAssigneeDistribution(profileId, allCombined), dashboardExecutor);
        var patientCountFuture = CompletableFuture.supplyAsync(
                () -> patientListService.getAllPatientsByStages(ActivePatientRequestV2.builder()
                        .doctorId(doctorId)
                        .organizationId(organizationId)
                        .profileId(profileId)
                        .filterByAppInviteStatus(AppInviteStatus.ALL)
                        .patientType(PatientType.ALL)
                        .doctorRole(DoctorRole.IN_OFFICE_MANUFACTURER)
                        .isPatientCountRequest(true)
                        .build()),
                dashboardExecutor);
        var alignerAnalyticsFuture = CompletableFuture.supplyAsync(
                () -> alignerAnalyticsQueryRepository.getAlignerAnalyticsCountsByOrg(organizationId),
                dashboardExecutor);
        var chartCountFuture = CompletableFuture.supplyAsync(
                () -> alignerAnalyticsService.getChartCountData(ChartCountForAnalyticsRequest.builder()
                        .doctorId(doctorId)
                        .organizationId(organizationId)
                        .profileId(profileId)
                        .build()),
                dashboardExecutor);
        var appInviteFuture = CompletableFuture.supplyAsync(
                () -> patientRepository.getAppInviteStatusCountsByOrganization(
                        organizationId,
                        List.of(
                                DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                                DoctorRole.IN_OFFICE_MANUFACTURER.name())),
                dashboardExecutor);
        var kanbanIndividualFuture = CompletableFuture.supplyAsync(
                () -> patientTaskTrackerRepository.getWorkflowCounts(profileId), dashboardExecutor);

        CompletableFuture.allOf(
                        kanbanFuture,
                        dueFuture,
                        userProfileFuture,
                        newCaseAssigneeFuture,
                        productionAssigneeFuture,
                        planningAssigneeFuture,
                        allAssigneeFuture,
                        patientCountFuture,
                        alignerAnalyticsFuture,
                        chartCountFuture,
                        appInviteFuture,
                        kanbanIndividualFuture)
                .join();

        var kanbanDetails = kanbanFuture.join();
        var patientDueStatusCounts = dueFuture.join();
        var userProfile = userProfileFuture.join();
        var newCaseAssignee = newCaseAssigneeFuture.join();
        var productionAssignee = productionAssigneeFuture.join();
        var planningAssignee = planningAssigneeFuture.join();
        var allAssignee = allAssigneeFuture.join();
        var patientCountResponse = patientCountFuture.join();
        var alignerAnalyticsCounts = alignerAnalyticsFuture.join();
        var alignerAnalyticsCountResponse = chartCountFuture.join();
        var appInviteStatusCount = appInviteFuture.join();
        var kanbanIndividualCount = kanbanIndividualFuture.join();

        var unreadNotification = timelineService.getTotalActiveEventCount(doctorId, userProfile);

        var patientsSummary = DoctorDashboardResponseV4.PatientsSummary.from(patientCountResponse);

        Integer newCaseTotalCount =
                newCaseAssignee.isEmpty() ? 0 : newCaseAssignee.get(0).getTotalCounts();
        Integer planningTotalCount =
                planningAssignee.isEmpty() ? 0 : planningAssignee.get(0).getTotalCounts();

        var patientCompliance = DoctorDashboardResponseV4.PatientCompliance.from(alignerAnalyticsCounts);
        var appConnectionStatus = DoctorDashboardResponseV4.AppConnectionStatus.from(appInviteStatusCount);
        int treatmentTrackingCount = patientsSummary != null ? patientsSummary.getTreatmentTrackingCount() : 0;
        var pendingUpdates = DoctorDashboardResponseV4.PendingUpdates.from(alignerAnalyticsCountResponse);

        treatmentTrackingCount = treatmentTrackingCount
                + patientCompliance.getTotal()
                + appConnectionStatus.getTotal()
                + pendingUpdates.getTotal();
        dashboardDetailsBuilder.growthPlan(DoctorDashboardResponseV4.GrowthPlan.builder()
                .kanbanDetails(kanbanDetails)
                .unprocessedBatches(DoctorDashboardResponseV4.Unprocessed.from(patientDueStatusCounts))
                .patientsSummary(patientsSummary)
                .treatmentStage(
                        DoctorDashboardResponseV4.TreatmentStage.from(patientCountResponse.getPatientCountResponse()))
                .patientCompliance(patientCompliance)
                .newCaseAssigneeDistribution(newCaseAssignee)
                .planningOperationAssigneeDistribution(planningAssignee)
                .productionOperationAssigneeDistribution(productionAssignee)
                .teamWorkloadOverview(allAssignee)
                .sectionCounts(DoctorDashboardResponseV4.SectionCounts.from(
                        newCaseTotalCount, planningTotalCount, treatmentTrackingCount, kanbanIndividualCount))
                .pendingUpdates(pendingUpdates)
                .appConnectionStatus(appConnectionStatus)
                .unreadNotificationCount(unreadNotification)
                .build());
    }

    private void getPracticeConnectedOrDashboardDetailsV4(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV4.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {

        Long profileId = request.getProfileId();
        long doctorId = request.getDoctorId();
        long organizationId = request.getOrganizationId();

        var userProfileFuture = CompletableFuture.supplyAsync(
                () -> userProfileRepository
                        .findByIdWithOrgAndDoctorAndUseWithInviterRoles(profileId)
                        .orElseThrow(() -> new DoctorNotFoundException(doctorId)),
                dashboardExecutor);
        var countsFuture = CompletableFuture.supplyAsync(
                () -> orderRepository.getPlanningPracticeCounts(profileId), dashboardExecutor);
        var unreadMsgFuture = CompletableFuture.supplyAsync(
                () -> participantRepository.countTotalUnreadMessages(profileId), dashboardExecutor);
        var alignerFuture = CompletableFuture.supplyAsync(
                () -> alignerAnalyticsQueryRepository.getAlignerAnalyticsCountsByOrgAndUserProfileId(
                        organizationId, profileId),
                dashboardExecutor);
        var patientCountFuture = CompletableFuture.supplyAsync(
                () -> patientListService.getAllPatientsByStages(ActivePatientRequestV2.builder()
                        .doctorId(doctorId)
                        .organizationId(organizationId)
                        .profileId(profileId)
                        .filterByAppInviteStatus(AppInviteStatus.ALL)
                        .patientType(PatientType.ALL)
                        .doctorRole(DoctorRole.CONSULTING_ORTHODONTIST)
                        .isPatientCountRequest(true)
                        .build()),
                dashboardExecutor);

        CompletableFuture.allOf(userProfileFuture, countsFuture, unreadMsgFuture, alignerFuture, patientCountFuture)
                .join();

        var userProfile = userProfileFuture.join();
        var counts = countsFuture.join();
        var unreadMessageCount = unreadMsgFuture.join();
        var alignerAnalyticsCounts = alignerFuture.join();
        var patientCountResponse = patientCountFuture.join();

        var unreadNotification = timelineService.getTotalActiveEventCount(doctorId, userProfile);

        int needsAttention = Optional.ofNullable(alignerAnalyticsCounts)
                .map(AlignerAnalyticsCounts::getNeedsAttentionCount)
                .orElse(0);
        int atRisk = Optional.ofNullable(alignerAnalyticsCounts)
                .map(AlignerAnalyticsCounts::getAtRiskCount)
                .orElse(0);
        int onTrack = Optional.ofNullable(alignerAnalyticsCounts)
                .map(AlignerAnalyticsCounts::getOnTrackCount)
                .orElse(0);

        long readyToStart = Optional.ofNullable(patientCountResponse)
                .map(r -> r.getPatientCountResponse().getStartingSoon())
                .orElse(0);

        var practiceCounts = DoctorDashboardResponseV4.PracticeConnectedToOrg.PracticeDashboardCounts.builder()
                .draft(counts.getDraft())
                .planning(counts.getInProgress())
                .needInfo(counts.getNeedInfo())
                .approvalPending(counts.getInReview())
                .inRevision(counts.getInRevision())
                .approved(counts.getApproved())
                .manufacturing(0L)
                .shipped(0L)
                .readyToStart(readyToStart)
                .onTrack((long) onTrack)
                .needsAttention((long) needsAttention)
                .atRisk((long) atRisk)
                .activeCases(counts.getActive())
                .completed(counts.getCompleted())
                .casesThisMonth(counts.getCasesThisMonth())
                .casesLastMonth(counts.getCasesLastMonth())
                .lastActivityDate(counts.getLastActivityDate())
                .totalUnreadChatCount(unreadMessageCount)
                .build();

        dashboardDetailsBuilder.practiceConnectedToOrg(DoctorDashboardResponseV4.PracticeConnectedToOrg.builder()
                .counts(practiceCounts)
                .unreadNotificationCount(unreadNotification)
                .build());
    }

    private void getEnterprisePlanDashboardDetailsV4(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV4.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {
        long doctorId = request.getDoctorId();
        long organizationId = request.getOrganizationId();
        long profileId = request.getProfileId();

        List<String> newCaseWorkflowNames = List.of(NEW_CASE_WORKFLOW);
        List<String> planningWorkflowNames = Arrays.asList(PLANNING_IN_HOUSE_WORKFLOW, PLAN_OUTSOURCED_WORKFLOW);
        List<String> productionWorkflowNames =
                Arrays.asList(PRODUCTION_IN_HOUSE_WORKFLOW, PRODUCTION_OUTSOURCE_WORKFLOW);
        List<String> allCombined = Arrays.asList(
                NEW_CASE_WORKFLOW,
                PLANNING_IN_HOUSE_WORKFLOW,
                PLAN_OUTSOURCED_WORKFLOW,
                PRODUCTION_IN_HOUSE_WORKFLOW,
                PRODUCTION_OUTSOURCE_WORKFLOW);

        var kanbanFuture = CompletableFuture.supplyAsync(
                () -> kanbanService.getWorkflowKanbanSummaryByProfile(profileId), dashboardExecutor);
        var dueFuture = CompletableFuture.supplyAsync(
                () -> patientDoctorOrganizationRepository.getPatientDueStatusCountsByOrgForUnprocessedAligner(
                        organizationId),
                dashboardExecutor);
        var newCaseAssigneeFuture = CompletableFuture.supplyAsync(
                () -> getAssigneeDistribution(profileId, newCaseWorkflowNames), dashboardExecutor);
        var productionAssigneeFuture = CompletableFuture.supplyAsync(
                () -> getAssigneeDistribution(profileId, productionWorkflowNames), dashboardExecutor);
        var planningAssigneeFuture = CompletableFuture.supplyAsync(
                () -> getAssigneeDistribution(profileId, planningWorkflowNames), dashboardExecutor);
        var allAssigneeFuture =
                CompletableFuture.supplyAsync(() -> getAssigneeDistribution(profileId, allCombined), dashboardExecutor);
        var patientCountFuture = CompletableFuture.supplyAsync(
                () -> patientListService.getAllPatientsByStages(ActivePatientRequestV2.builder()
                        .doctorId(doctorId)
                        .organizationId(organizationId)
                        .profileId(profileId)
                        .filterByAppInviteStatus(AppInviteStatus.ALL)
                        .patientType(PatientType.ALL)
                        .doctorRole(DoctorRole.ENTERPRISE_COMPANY_LAB)
                        .customerOrPracticeRole(DoctorRole.CONSULTING_ORTHODONTIST)
                        .isPatientCountRequest(true)
                        .build()),
                dashboardExecutor);
        var alignerAnalyticsFuture = CompletableFuture.supplyAsync(
                () -> alignerAnalyticsQueryRepository.getAlignerAnalyticsCountsByOrg(organizationId),
                dashboardExecutor);
        var chartCountFuture = CompletableFuture.supplyAsync(
                () -> alignerAnalyticsService.getChartCountData(ChartCountForAnalyticsRequest.builder()
                        .doctorId(doctorId)
                        .organizationId(organizationId)
                        .profileId(profileId)
                        .build()),
                dashboardExecutor);
        var appInviteFuture = CompletableFuture.supplyAsync(
                () -> patientRepository.getAppInviteStatusCountsByOrganization(
                        organizationId,
                        List.of(
                                DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                DoctorRole.IN_OFFICE_MANUFACTURER.name())),
                dashboardExecutor);
        var kanbanIndividualFuture = CompletableFuture.supplyAsync(
                () -> patientTaskTrackerRepository.getWorkflowCounts(profileId), dashboardExecutor);
        var userProfileFuture = CompletableFuture.supplyAsync(
                () -> userProfileRepository
                        .findByIdWithOrgAndDoctorAndUseWithInviterRoles(profileId)
                        .orElseThrow(() -> new DoctorNotFoundException(doctorId)),
                dashboardExecutor);
        var unreadChatFuture = CompletableFuture.supplyAsync(
                () -> doctorChatRepository.countUnreadChatsByUserProfileId(profileId), dashboardExecutor);

        CompletableFuture.allOf(
                        kanbanFuture,
                        dueFuture,
                        newCaseAssigneeFuture,
                        productionAssigneeFuture,
                        planningAssigneeFuture,
                        allAssigneeFuture,
                        patientCountFuture,
                        alignerAnalyticsFuture,
                        chartCountFuture,
                        appInviteFuture,
                        kanbanIndividualFuture,
                        userProfileFuture,
                        unreadChatFuture)
                .join();

        var kanbanDetails = kanbanFuture.join();
        var patientDueStatusCounts = dueFuture.join();
        var newCaseAssignee = newCaseAssigneeFuture.join();
        var productionAssignee = productionAssigneeFuture.join();
        var planningAssignee = planningAssigneeFuture.join();
        var allAssignee = allAssigneeFuture.join();
        var patientCountResponse = patientCountFuture.join();
        var alignerAnalyticsCounts = alignerAnalyticsFuture.join();
        var alignerAnalyticsCountResponse = chartCountFuture.join();
        var appInviteStatusCount = appInviteFuture.join();
        var kanbanIndividualCount = kanbanIndividualFuture.join();
        var userProfile = userProfileFuture.join();
        var unreadChatCount = unreadChatFuture.join();

        var unreadNotification = timelineService.getTotalActiveEventCount(doctorId, userProfile);

        var patientsSummary = DoctorDashboardResponseV4.PatientsSummary.from(patientCountResponse);

        Integer newCaseTotalCount =
                newCaseAssignee.isEmpty() ? 0 : newCaseAssignee.get(0).getTotalCounts();
        Integer planningTotalCount =
                planningAssignee.isEmpty() ? 0 : planningAssignee.get(0).getTotalCounts();

        var patientCompliance = DoctorDashboardResponseV4.PatientCompliance.from(alignerAnalyticsCounts);
        var appConnectionStatus = DoctorDashboardResponseV4.AppConnectionStatus.from(appInviteStatusCount);
        int treatmentTrackingCount = patientsSummary != null ? patientsSummary.getTreatmentTrackingCount() : 0;
        var pendingUpdates = DoctorDashboardResponseV4.PendingUpdates.from(alignerAnalyticsCountResponse);

        treatmentTrackingCount = treatmentTrackingCount
                + patientCompliance.getTotal()
                + appConnectionStatus.getTotal()
                + pendingUpdates.getTotal();
        var pendingInvitationCount = appInviteStatusCount.getPendingCount();
        var approvedCount = getWorkflowStatusCount(kanbanDetails, PLAN_OUTSOURCED_WORKFLOW, APPROVED);
        var inReviewCount = getWorkflowStatusCount(kanbanDetails, PLAN_OUTSOURCED_WORKFLOW, IN_REVIEW);

        dashboardDetailsBuilder.enterprisePlan(DoctorDashboardResponseV4.EnterprisePlan.builder()
                .kanbanDetails(kanbanDetails)
                .unprocessedBatches(DoctorDashboardResponseV4.Unprocessed.from(patientDueStatusCounts))
                .patientsSummary(patientsSummary)
                .treatmentStage(
                        DoctorDashboardResponseV4.TreatmentStage.from(patientCountResponse.getPatientCountResponse()))
                .patientCompliance(patientCompliance)
                .newCaseAssigneeDistribution(newCaseAssignee)
                .planningOperationAssigneeDistribution(planningAssignee)
                .productionOperationAssigneeDistribution(productionAssignee)
                .teamWorkloadOverview(allAssignee)
                .sectionCounts(DoctorDashboardResponseV4.SectionCounts.from(
                        newCaseTotalCount, planningTotalCount, treatmentTrackingCount, kanbanIndividualCount))
                .pendingUpdates(pendingUpdates)
                .appConnectionStatus(appConnectionStatus)
                .coretask(DoctorDashboardResponseV4.CoreTask.builder()
                        .newCase(newCaseTotalCount)
                        .approvePlan(null)
                        .invitationPending(pendingInvitationCount)
                        .moveToProduction(null)
                        .alignerChangesAndCheckIns(alignerAnalyticsCountResponse.getUniquePatientWithActionCounts())
                        .approvePlan(approvedCount)
                        .moveToProduction(inReviewCount)
                        .startingSoon(
                                patientCountResponse.getPatientCountResponse().getStartingSoon())
                        .build())
                .unreadNotificationCount(unreadNotification)
                .totalUnreadChatCount(unreadChatCount)
                .build());
    }

    private void getEnterprisePlanningUserDashboardDetailsV4(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV4.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        var unreadNotification = timelineService.getTotalActiveEventCount(request.getDoctorId(), userProfile);

        if (isAdminWithDefaultTag && userProfile.getInviterProfile() != null) {
            var inviterProfile = userProfile.getInviterProfile();
            request.setProfileId(inviterProfile.getId());
        }
        var kanbanDetails = kanbanService.getWorkflowKanbanSummaryByProfile(request.getProfileId());
        long profileId = request.getProfileId();
        var totalOrdersCount = orderRepository.countPatientsByProfileId(profileId);
        var unreadMessageCount = participantRepository.countTotalUnreadMessages(profileId);

        dashboardDetailsBuilder.enterprisePlanningUser(DoctorDashboardResponseV4.EnterprisePlanning.builder()
                .kanbanDetails(kanbanDetails)
                .planName(PlanName.PLANNING)
                .totalPatientCount(totalOrdersCount)
                .totalUnreadChatCount(unreadMessageCount)
                .unreadNotificationCount(unreadNotification)
                .build());
    }

    private void getEnterpriseManufacturingUserDashboardDetailsV4(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV4.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {

        var kanbanDetails = kanbanService.getWorkflowKanbanSummaryByProfile(request.getProfileId());
        long profileId = request.getProfileId();
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        var unreadNotification = timelineService.getTotalActiveEventCount(request.getDoctorId(), userProfile);

        var totalOrdersCount = treatmentPlanRepository.countPatientsByProfileIdForTreatmentPlan(profileId);

        dashboardDetailsBuilder.enterprisePlanningUser(DoctorDashboardResponseV4.EnterprisePlanning.builder()
                .kanbanDetails(kanbanDetails)
                .planName(PlanName.MANUFACTURING)
                .totalPatientCount(totalOrdersCount)
                .unreadNotificationCount(unreadNotification)
                .build());
    }

    private void getCustomInternalUserPlanDashboardDetailsV4(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV4.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        var unreadNotification = timelineService.getTotalActiveEventCount(request.getDoctorId(), userProfile);

        if (isAdminWithDefaultTag && userProfile.getInviterProfile() != null) {
            var inviterProfile = userProfile.getInviterProfile();
            var inHouseManufacturingLab = inviterProfile.isInHouseManufacturingLab();
            var isEnterprise = inviterProfile.isEnterprise();
            updateUserProfileInRequest(request, inviterProfile);
            if (inHouseManufacturingLab) {
                getGrowthPlanDashboardDetailsV4(request, dashboardDetailsBuilder);
            } else if (isEnterprise) {
                List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(request.getProfileId());
                if (enabledItems.stream().anyMatch("MANUFACTURING"::equals)) {
                    getEnterpriseManufacturingUserDashboardDetailsV4(request, dashboardDetailsBuilder);
                } else if (enabledItems.stream().anyMatch("PLANNING"::equals)) {
                    getEnterprisePlanningUserDashboardDetailsV4(request, dashboardDetailsBuilder);
                } else {
                    getEnterprisePlanDashboardDetailsV4(request, dashboardDetailsBuilder);
                }
            }
        } else {
            var kanbanDetails = kanbanService.getWorkflowKanbanSummaryByProfile(request.getProfileId());
            var totalPatientCount =
                    patientTaskTrackerRepository.countUniquePatientsByAssigneeOrCreator(request.getProfileId());
            dashboardDetailsBuilder.internalUserPlan(DoctorDashboardResponseV4.InternalUserPlan.builder()
                    .kanbanDetails(kanbanDetails)
                    .totalPatientCount(totalPatientCount)
                    .unreadNotificationCount(unreadNotification)
                    .build());
        }
    }

    private void updateUserProfileInRequest(DoctorDashboardRequest request, UserProfile inviterProfile) {
        request.setProfileId(inviterProfile.getId());
        request.setDoctorId(inviterProfile.getDoctor().getId());
        request.setOrganizationId(inviterProfile.getOrganization().getId());
    }

    private Long getWorkflowStatusCount(
            WorkflowKanbanSummaryResponse kanbanDetails, String workflowName, String workflowStatusName) {
        if (kanbanDetails == null || kanbanDetails.getDetails() == null) {
            return 0L;
        }

        return kanbanDetails.getDetails().stream()
                .filter(workflow -> workflowName.equals(workflow.getKanbanName())
                        || workflowName.equals(workflow.getWorkflowLabelName()))
                .findFirst()
                .stream()
                .flatMap(workflow -> workflow.getStatusLabels().stream())
                .filter(status ->
                        workflowStatusName.equals(status.getName()) || workflowStatusName.equals(status.getLabelName()))
                .findFirst()
                .map(LabelCountResponse::getCount)
                .orElse(0L);
    }

    public List<DoctorDashboardResponseV4.AssigneeDistributionResponse> getAssigneeDistribution(
            Long createdByProfileId, List<String> workflowNames) {

        List<AssigneeDistributionProjection> projections =
                patientTaskTrackerRepository.getAssigneeDistributionByWorkflows(createdByProfileId, workflowNames);

        return projections.stream().map(this::mapToAssigneeDistributionResponse).collect(Collectors.toList());
    }

    private DoctorDashboardResponseV4.AssigneeDistributionResponse mapToAssigneeDistributionResponse(
            AssigneeDistributionProjection projection) {

        double percentage = projection.getPercentage() != null ? projection.getPercentage() : 0.0;

        return DoctorDashboardResponseV4.AssigneeDistributionResponse.builder()
                .userName(projection.getUserName())
                .role(projection.getRole())
                .caseCount(projection.getCaseCount())
                .percentage(percentage)
                .assigneeType(projection.getAssigneeType())
                .overdueCount(
                        projection.getOverdueCount() != null
                                ? projection.getOverdueCount().intValue()
                                : 0)
                .totalCounts(projection.getTotalTaskCount())
                .build();
    }

    private void getEnterprisePlanDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {
        Long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();

        OrdersCountResponse orderSentToLabs =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, true, null);

        OrdersCountResponse receivedOrdersFromPractice = orderResponseService.getPracticeLabAndCustomerOrders(
                doctorId, organizationId, profileId, DoctorRole.CONSULTING_ORTHODONTIST, null);

        OrdersCountResponse receivedOrdersFromCustomer = orderResponseService.getPracticeLabAndCustomerOrders(
                doctorId, organizationId, profileId, DoctorRole.CUSTOMER, null);

        AlignerAnalyticsCounts alignerAnalyticsCounts =
                alignerAnalyticsQueryRepository.getAlignerAnalyticsCountsByOrg(organizationId);
        PatientDueStatusCounts patientDueStatusCounts =
                patientDoctorOrganizationRepository.getPatientDueStatusCountsByOrgForUnprocessedAligner(organizationId);

        var labelName = buildLabels(request.getProfileId(), true);
        dashboardDetailsBuilder.labelName(labelName);
        var patientCountResponse = patientListService.getPatientCount(ActivePatientRequestV2.builder()
                .doctorId(doctorId)
                .organizationId(organizationId)
                .profileId(profileId)
                .filterByAppInviteStatus(AppInviteStatus.ALL)
                .patientType(PatientType.ALL)
                .doctorRole(DoctorRole.ALIGNER_COMPANY_OR_LAB)
                .build());
        var manufacturingCounts =
                manufacturingRepository.countManufacturingBatchesByTargetProfile(request.getProfileId());
        var pendingPatientsWithoutBatches = treatmentPlanRepository.countReceivedOrdersByProfileIdAndRoleId(
                request.getProfileId(),
                List.of(DoctorRole.CONSULTING_ORTHODONTIST.name(), DoctorRole.CUSTOMER.name()),
                ManufacturingStatus.MANUFACTURING_PENDING,
                ManufacturingStatus.MANUFACTURING_PENDING.name());

        InvitationCountsProjection invitationsCounts = doctorInvitationRepository.countAllInvitations(
                doctorId,
                organizationId,
                List.of(InvitationRole.CONSULTING_ORTHODONTIST),
                List.of(InvitationRole.CUSTOMER),
                List.of(InvitationRole.VENDOR, InvitationRole.COMMERCIAL_ALIGNER_LAB),
                List.of(InvitationRole.VENDOR));
        var growthMetrics = calculateGrowthMetrics(profileId);

        DoctorInvitationCountDetails doctorInvitationCount = doctorService.getInvitationCountOfAllRoles(
                DoctorInvitationCountRequest.from(doctorId, organizationId, profileId, true));
        Double labGrowth = growthMetrics.sentGrowth();

        Double growthForPractice = growthMetrics.receivedGrowthForPractice();
        Double growthForCustomer = growthMetrics.receivedGrowthForCustomer();
        dashboardDetailsBuilder.enterpriseProfessionalPlan(
                DoctorDashboardResponseV3.EnterpriseProfessionalPlan.builder()
                        .home(DoctorDashboardResponseV3.EnterpriseHome.from(
                                receivedOrdersFromPractice,
                                receivedOrdersFromCustomer,
                                orderSentToLabs,
                                invitationsCounts,
                                manufacturingCounts,
                                pendingPatientsWithoutBatches,
                                patientCountResponse,
                                growthForPractice,
                                growthForCustomer,
                                labGrowth))
                        .practiceOrders(DoctorDashboardResponseV3.PracticeOrders.from(
                                patientCountResponse,
                                alignerAnalyticsCounts,
                                receivedOrdersFromPractice,
                                manufacturingCounts,
                                pendingPatientsWithoutBatches,
                                patientDueStatusCounts))
                        .customerOrders(DoctorDashboardResponseV3.CustomerOrders.from(
                                receivedOrdersFromCustomer, growthForCustomer, doctorInvitationCount))
                        .labOrders(DoctorDashboardResponseV3.EnterpriseProfessionalLabOrders.from(orderSentToLabs))
                        .build());
    }

    private void getStarterPlanDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {
        Long profileId = request.getProfileId();
        LocalDate today = LocalDate.now();
        Long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Integer appointmentCounts = reminderRepository.countByDoctorAndDateAndStatusesAndPurpose(
                profileId,
                today,
                List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED),
                ReminderPurpose.APPOINTMENT);
        OrdersCountResponse sentOrdersCount =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, true, null);
        var alignerUpdateCounts = alignerActionRepository.getTotalUnvalidatedActionsForProfile(
                request.getDoctorId(), request.getOrganizationId(), request.getProfileId());
        DoctorDashboardCount dashboardCount =
                doctorDashboardService.getDashboardCount(doctorId, organizationId, profileId);
        var allPatientMetrics = patientListService.getAllPatientMetrics(
                doctorId, organizationId, profileId, request.getRoles().get(0));
        dashboardDetailsBuilder.starterPlan(DoctorDashboardResponseV3.StarterPlan.builder()
                .patientsSummary(DoctorDashboardResponseV3.PatientsSummary.from(allPatientMetrics))
                .myTasks(DoctorDashboardResponseV3.MyTasks.from(
                        alignerUpdateCounts, appointmentCounts, dashboardCount, sentOrdersCount))
                .patientCompliance(
                        DoctorDashboardResponseV3.PatientCompliance.from(dashboardCount.getPatientCompliance()))
                .build());
    }

    private void getProfessionalPlanDashboardDetails(
            DoctorDashboardRequest request,
            DoctorDashboardResponseV3.DashboardDetails.DashboardDetailsBuilder dashboardDetailsBuilder) {

        Long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();
        OrdersCountResponse sentOrdersCount =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, true, null);
        OrdersCountResponse receivedOrderCount =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, false, null);
        var growthMetrics = calculateGrowthMetrics(profileId);

        InvitationCountsProjection invitationsCounts = doctorInvitationRepository.countAllInvitations(
                doctorId,
                organizationId,
                List.of(InvitationRole.CONSULTING_ORTHODONTIST),
                List.of(InvitationRole.CUSTOMER),
                List.of(InvitationRole.VENDOR, InvitationRole.COMMERCIAL_ALIGNER_LAB),
                List.of(InvitationRole.VENDOR));

        var pendingPatientsWithoutBatches = treatmentPlanRepository.countReceivedOrdersByProfileIdAndRoleId(
                request.getProfileId(),
                List.of(DoctorRole.CONSULTING_ORTHODONTIST.name(), DoctorRole.CUSTOMER.name()),
                ManufacturingStatus.MANUFACTURING_PENDING,
                ManufacturingStatus.MANUFACTURING_PENDING.name());
        var manufacturingCounts =
                manufacturingRepository.countManufacturingBatchesByTargetProfile(request.getProfileId());
        var allPatients = patientListCountRepository
                .getPatientCountForOrg(
                        organizationId,
                        null,
                        null,
                        null,
                        PatientType.ALL.name(),
                        List.of(
                                DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                DoctorRole.ENTERPRISE_COMPANY_LAB.name()))
                .intValue();
        Integer labSentCount = invitationsCounts.getLabSentCount() != null ? invitationsCounts.getLabSentCount() : 0;
        Integer labReceivedCount =
                invitationsCounts.getLabReceivedCount() != null ? invitationsCounts.getLabReceivedCount() : 0;
        Integer labCount = labReceivedCount + labSentCount;

        OrdersCountResponse receivedOrdersFromPractice = orderResponseService.getPracticeLabAndCustomerOrders(
                doctorId, organizationId, profileId, DoctorRole.CONSULTING_ORTHODONTIST, null);
        AlignerAnalyticsCounts alignerAnalyticsCounts =
                alignerAnalyticsQueryRepository.getAlignerAnalyticsCountsByOrg(organizationId);
        PatientDueStatusCounts patientDueStatusCounts =
                patientDoctorOrganizationRepository.getPatientDueStatusCountsByOrgForUnprocessedAligner(organizationId);

        var patientCount = patientListService.getPatientCount(ActivePatientRequestV2.builder()
                .doctorId(doctorId)
                .organizationId(organizationId)
                .profileId(profileId)
                .filterByAppInviteStatus(AppInviteStatus.ALL)
                .patientType(PatientType.ALL)
                .doctorRole(DoctorRole.ALIGNER_COMPANY_OR_LAB)
                .build());
        var workSpace = DoctorDashboardResponseV3.PracticeOrders.from(
                patientCount,
                alignerAnalyticsCounts,
                receivedOrdersFromPractice,
                manufacturingCounts,
                pendingPatientsWithoutBatches,
                patientDueStatusCounts);
        var customerView = DoctorDashboardResponseV3.CustomerView.from(sentOrdersCount);
        var labelName = buildLabels(request.getProfileId(), false);
        dashboardDetailsBuilder.labelName(labelName);
        dashboardDetailsBuilder.professionalPlan(DoctorDashboardResponseV3.ProfessionalPlan.builder()
                .customerView(DoctorDashboardResponseV3.CustomerView.from(sentOrdersCount))
                .workspace(workSpace)
                .home(DoctorDashboardResponseV3.Home.from(
                        sentOrdersCount,
                        receivedOrderCount,
                        growthMetrics.sentGrowth,
                        allPatients,
                        invitationsCounts.getPracticeCount(),
                        labCount,
                        growthMetrics.receivedGrowth,
                        manufacturingCounts,
                        pendingPatientsWithoutBatches,
                        workSpace,
                        customerView))
                .build());
    }

    private GrowthMetrics calculateGrowthMetrics(Long profileId) {
        var metrics = DashboardGrowthMetricsUtil.calculateGrowthMetrics(profileId, orderRepository);
        return new GrowthMetrics(
                metrics.sentGrowth(),
                metrics.receivedGrowth(),
                metrics.sentGrowthForPractice(),
                metrics.receivedGrowthForPractice(),
                metrics.sentGrowthForCustomer(),
                metrics.receivedGrowthForCustomer());
    }

    private DoctorDashboardResponseV3.LabelName buildLabels(Long profileId, boolean isEnterprise) {
        var dashboardLabels = dashboardLabelRepository.findByProfileId(profileId);
        if (dashboardLabels.isPresent()) {
            return DoctorDashboardResponseV3.LabelName.from(dashboardLabels.get());
        }
        if (isEnterprise) {
            return DoctorDashboardResponseV3.LabelName.enterprisePlanName();
        }
        return DoctorDashboardResponseV3.LabelName.from();
    }

    private record GrowthMetrics(
            Double sentGrowth,
            Double receivedGrowth,
            Double sentGrowthForPractice,
            Double receivedGrowthForPractice,
            Double sentGrowthForCustomer,
            Double receivedGrowthForCustomer) {}
}
