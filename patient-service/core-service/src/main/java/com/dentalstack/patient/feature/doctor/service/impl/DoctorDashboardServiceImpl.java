package com.dentalstack.patient.feature.doctor.service.impl;

import com.dentalstack.patient.feature.aligner.dto.aligner.UpcomingAlignerChangesDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.PendingPatientActionCategorizedResponse;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.PendingPatientActionRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.PendingPatientActionResponse;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerChangeStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerTreatmentStage;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerNotFoundException;
import com.dentalstack.patient.feature.aligner.projection.AlignerAnalyticsCounts;
import com.dentalstack.patient.feature.aligner.projection.AlignerJourneySummary;
import com.dentalstack.patient.feature.aligner.projection.BracesJourneySummary;
import com.dentalstack.patient.feature.aligner.repository.AlignerAnalyticsQueryRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.action.AlignerActionRepository;
import com.dentalstack.patient.feature.appointment.dto.MobileDashboardDoctorDetails;
import com.dentalstack.patient.feature.braces.dto.BracesJourneyDetails;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.braces.service.BracesJourneyService;
import com.dentalstack.patient.feature.caseinfo.repository.CaseInformationRepository;
import com.dentalstack.patient.feature.dashboardlabel.repository.DashboardLabelRepository;
import com.dentalstack.patient.feature.doctor.dto.*;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.service.DoctorDashboardService;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.doctor.util.DashboardGrowthMetricsUtil;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationRole;
import com.dentalstack.patient.feature.doctorinvitation.repository.DoctorInvitationRepository;
import com.dentalstack.patient.feature.invitation.dto.AllInvitationDetailsForMobile;
import com.dentalstack.patient.feature.invitation.dto.NotSetUpTreatmentPatient;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.entity.PatientInvitationDetails;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.projection.InvitationCountsProjection;
import com.dentalstack.patient.feature.invitation.projection.InvitationStatusSummary;
import com.dentalstack.patient.feature.invitation.projection.InvitationSummary;
import com.dentalstack.patient.feature.invitation.projection.PatientInvitationStatusSummary;
import com.dentalstack.patient.feature.invitation.repository.InvitationRepository;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.invitation.service.InvitationService;
import com.dentalstack.patient.feature.notification.dto.ChatPatientResponse;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.order.dto.OrdersCountResponse;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.order.service.OrderResponseService;
import com.dentalstack.patient.feature.patient.dto.PatientCount;
import com.dentalstack.patient.feature.patient.dto.PatientPendingStatus;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.*;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.patient.util.LeadTreatmentStageResolver;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionPlanDTO;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanSummary;
import com.dentalstack.patient.feature.treatment.projection.TreatmentStageDTOSummery;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.entity.Address;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.exception.BadRequestException;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DoctorDashboardServiceImpl implements DoctorDashboardService {

    private final DoctorService doctorService;

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final AlignerAnalyticsQueryRepository alignerAnalyticsQueryRepository;
    private final PatientRepository patientRepository;
    private final InvitationService invitationService;
    private final BracesJourneyService bracesJourneyService;
    private final InvitationRepository invitationRepository;
    private final BracesJourneyRepository bracesJourneyRepository;

    private final PatientInvitationDetailsRepository patientInvitationDetailsRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final TrackingRepository trackingRepository;
    private final ChatService chatService;
    private final TimelineService timelineService;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;

    private final UserProfileRepository userProfileRepository;
    private final FileRepository fileRepository;
    private final CaseInformationRepository caseInformationRepository;
    private final OrderResponseService orderResponseService;
    private final AlignerActionRepository alignerActionRepository;
    private final ReminderRepository reminderRepository;
    private final DoctorInvitationRepository doctorInvitationRepository;
    private final OrderRepository orderRepository;
    private final DashboardLabelRepository dashboardLabelRepository;
    String FILES_FOLDER_NAME = "files";

    @Override
    public List<PatientResponse> getPatientDetailsForChatDashboard(Long doctorId, Long organizationId, Long profileId) {
        var patients = patientDoctorOrganizationRepository.findPatientsSummeryByDoctorOrgAndProfile(
                doctorId, organizationId, profileId);
        if (patients == null || patients.isEmpty()) {
            return Collections.emptyList();
        }
        return patients.stream().map(PatientResponse::from).collect(Collectors.toList());
    }

    public DoctorDashboardResponse getDoctorDashboardData(DoctorDashboardRequest request) {
        DoctorDashboardResponse.DashboardDetails dashboardDetails;
        DoctorDashboardResponse response = new DoctorDashboardResponse();
        Long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();
        UserProfile userProfile =
                userProfileRepository.findByIdWithRoles(profileId).orElseThrow(DoctorNotFoundException::new);

        var doctorRole = getMatchingDoctorRole(userProfile.getRoles());
        boolean isPractice = userProfile.getRoles().stream()
                .anyMatch(role -> role.getName().equals(DoctorRole.CONSULTING_ORTHODONTIST.name()));

        DoctorDashboardCount dashboardCount = getDashboardCount(doctorId, organizationId, profileId);
        OrdersCountResponse sentOrdersCount =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, true, null);
        OrdersCountResponse receivedOrderCount =
                orderResponseService.getReceivedOrSentOrderCount(doctorId, organizationId, profileId, false, null);

        var growthMetrics = calculateGrowthMetrics(profileId);

        if (SubscriptionPlanDTO.PlanName.ENTERPRISE.equals(request.getPlanName())) {
            dashboardDetails = new DoctorDashboardResponse.DashboardDetails();
            dashboardDetails.setUserInfo(buildUserInfo(profileId));
            dashboardDetails.setLabelName(buildLabels(request.getProfileId(), true));
            DoctorDashboardCount dashboardCountForPractice;
            OrdersCountResponse receivedOrderCountByPractice;
            if (isPractice) {
                dashboardCountForPractice = getDashboardCountForEnterprise(
                        doctorId, organizationId, profileId, List.of(DoctorRole.CONSULTING_ORTHODONTIST.name()));
            } else {
                dashboardCountForPractice = getDashboardCountForEnterprise(
                        doctorId,
                        organizationId,
                        profileId,
                        List.of(DoctorRole.CONSULTING_ORTHODONTIST.name(), DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
            }

            DoctorDashboardCount dashboardCountForCustomer = getDashboardCountForEnterprise(
                    doctorId, organizationId, profileId, List.of(DoctorRole.CUSTOMER.name()));

            if (isPractice) {
                receivedOrderCountByPractice = orderResponseService.getReceivedOrSentOrderCount(
                        doctorId, organizationId, profileId, false, List.of(DoctorRole.CONSULTING_ORTHODONTIST.name()));
            } else {
                receivedOrderCountByPractice = orderResponseService.getReceivedOrSentOrderCount(
                        doctorId,
                        organizationId,
                        profileId,
                        false,
                        List.of(DoctorRole.CONSULTING_ORTHODONTIST.name(), DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
            }

            OrdersCountResponse receivedOrderCountByCustomer = orderResponseService.getReceivedOrSentOrderCount(
                    doctorId, organizationId, profileId, false, List.of(DoctorRole.CUSTOMER.name()));

            Double sentGrowth = growthMetrics.sentGrowth();
            Double receivedGrowthForPractice = growthMetrics.receivedGrowthForPractice();
            Double receivedGrowthForCustomer = growthMetrics.receivedGrowthForCustomer();

            DoctorDashboardResponse.ActivePracticeOrdersForEnterprise activePracticeOrders =
                    DoctorDashboardResponse.ActivePracticeOrdersForEnterprise.from(
                            receivedOrderCountByPractice.getCount(), receivedGrowthForPractice);

            DoctorDashboardResponse.PatientTreatmentStage patientTreatmentStage =
                    DoctorDashboardResponse.PatientTreatmentStage.from(dashboardCountForPractice);

            var buildReceivedOrderCountByPractice =
                    buildActivePracticeOrders(receivedOrderCountByPractice, receivedGrowthForPractice);

            var totalOrderTaskForPractice = buildWorkspaceTask(receivedOrderCountByPractice);
            var totalOrderTaskForCustomer = buildWorkspaceTask(receivedOrderCountByCustomer);

            DoctorDashboardResponse.PracticeOrders practiceOrders = DoctorDashboardResponse.PracticeOrders.from(
                    totalOrderTaskForPractice.getTotalPending(),
                    dashboardCountForPractice.getPatientCount().getTotal(),
                    dashboardCountForPractice.getPracticeCounts().getTotal(),
                    buildReceivedOrderCountByPractice.getTotal(),
                    receivedGrowthForPractice,
                    activePracticeOrders,
                    patientTreatmentStage);

            var buildActiveOrdersReceived = buildActiveCustomerOrders(receivedOrderCountByCustomer);

            DoctorDashboardResponse.CustomerOrders customerOrders = DoctorDashboardResponse.CustomerOrders.from(
                    getTotalPending(receivedOrderCountByCustomer),
                    dashboardCountForCustomer.getPatientCount().getTotal(),
                    dashboardCountForCustomer.getPracticeCounts().getTotalActiveCustomer(),
                    buildActiveOrdersReceived.getTotal(),
                    receivedGrowthForCustomer,
                    buildActiveOrdersReceived);

            DoctorDashboardResponse.OrdersSentToLab ordersSentToLab = DoctorDashboardResponse.OrdersSentToLab.from(
                    (sentOrdersCount != null && sentOrdersCount.getCount() != null
                                    ? (sentOrdersCount.getCount().getDraft() != null
                                            ? sentOrdersCount.getCount().getDraft()
                                            : 0)
                                    : 0)
                            + (sentOrdersCount != null && sentOrdersCount.getCount() != null
                                    ? (sentOrdersCount.getCount().getInReview() != null
                                            ? sentOrdersCount.getCount().getInReview()
                                            : 0)
                                    : 0)
                            + (sentOrdersCount != null && sentOrdersCount.getCount() != null
                                    ? (sentOrdersCount.getCount().getStlFileRequested() != null
                                            ? sentOrdersCount.getCount().getStlFileRequested()
                                            : 0)
                                    : 0)
                            + (sentOrdersCount != null && sentOrdersCount.getCount() != null
                                    ? (sentOrdersCount.getCount().getStlFileApproved() != null
                                            ? sentOrdersCount.getCount().getStlFileApproved()
                                            : 0)
                                    : 0),
                    sentOrdersCount != null && sentOrdersCount.getCount() != null
                            ? (sentOrdersCount.getCount().getUniquePatientCount() != null
                                    ? sentOrdersCount.getCount().getUniquePatientCount()
                                    : 0)
                            : 0,
                    dashboardCount != null && dashboardCount.getLabCounts() != null
                            ? (dashboardCount.getLabCounts().getTotal() != null
                                    ? dashboardCount.getLabCounts().getTotal()
                                    : 0)
                            : 0,
                    sentOrdersCount != null && sentOrdersCount.getCount() != null
                            ? (sentOrdersCount.getCount().getTotal() != null
                                    ? sentOrdersCount.getCount().getTotal()
                                    : 0)
                            : 0,
                    sentGrowth != null ? sentGrowth : 0,
                    sentOrdersCount != null ? sentOrdersCount.getCount() : null);

            var workspaceGlobalMetrics = buildWorkspaceTask(receivedOrderCountByPractice);
            var workspacePatientSummary = buildPatientsSummary(dashboardCountForPractice);
            var workspaceOngoingOrders = buildOngoingOrders(receivedOrderCountByPractice);
            var workspacePatientCompliance = buildPatientCompliance(dashboardCountForPractice);
            if (isPractice) {
                var practiceConnectedToOrgMyTask = buildPracticeConnectedTask(dashboardCount, sentOrdersCount);
                dashboardDetails.setPracticeConnectedToOrgMyTask(practiceConnectedToOrgMyTask);
            }

            DoctorDashboardResponse.WorkspaceMetrics workspaceMetrics = DoctorDashboardResponse.WorkspaceMetrics.from(
                    workspaceGlobalMetrics,
                    workspacePatientSummary,
                    workspaceOngoingOrders,
                    workspacePatientCompliance);

            var labMetrics = buildWorkspaceTaskForCustomer(sentOrdersCount);
            ordersSentToLab.setPendingUpdates(labMetrics.getTotalPending().longValue());

            if (receivedOrderCountByCustomer.getTask() != null) {
                long totalPending = getTotalPending(receivedOrderCountByCustomer);

                receivedOrderCountByCustomer.getTask().setTotalPending(totalPending);
            }

            dashboardDetails.setEnterprisePlanDetails(DoctorDashboardResponse.EnterprisePlanDetails.from(
                    practiceOrders,
                    customerOrders,
                    ordersSentToLab,
                    workspaceMetrics,
                    receivedOrderCountByCustomer,
                    labMetrics));

        } else {

            Double sentGrowth = growthMetrics.sentGrowth();
            Double receivedGrowth = growthMetrics.receivedGrowth();

            dashboardDetails = new DoctorDashboardResponse.DashboardDetails();

            dashboardDetails.setUserInfo(buildUserInfo(profileId));

            dashboardDetails.setPatientsSummary(buildPatientsSummary(dashboardCount));
            dashboardDetails.setPracticeSummary(
                    buildSummary(dashboardCount.getPracticeCounts().getTotal()));
            dashboardDetails.setLabsSummary(
                    buildSummary(dashboardCount.getLabCounts().getTotal()));

            var buildActiveOrdersSent = buildActiveOrdersSent(sentOrdersCount);

            dashboardDetails.setActivePracticeOrders(buildActivePracticeOrders(receivedOrderCount, receivedGrowth));
            dashboardDetails.setOrdersSent(
                    buildOrdersSent(sentOrdersCount, sentGrowth, buildActiveOrdersSent.getTotal()));
            dashboardDetails.setOrdersReceived(buildOrdersReceived(receivedOrderCount, receivedGrowth));
            dashboardDetails.setActiveOrdersSent(buildActiveOrdersSent);
            dashboardDetails.setOngoingOrders(buildOngoingOrders(receivedOrderCount));
            dashboardDetails.setSentOrderAllDetails(sentOrdersCount);
            dashboardDetails.setReceivedOrderAllDetails(receivedOrderCount);

            dashboardDetails.setPatientCompliance(buildPatientCompliance(dashboardCount));

            var professionalPlanWorkspaceMyTask = buildWorkspaceTask(receivedOrderCount);
            var practiceConnectedToOrgMyTask = buildPracticeConnectedTask(dashboardCount, sentOrdersCount);
            var growthAndStarterPlanMyTask = buildGrowthStarterTask(dashboardCount, sentOrdersCount);
            var professionalPlanCustomerViewMyTask = buildCustomerViewTask(sentOrdersCount);
            dashboardDetails.setProfessionalPlanWorkspaceMyTask(professionalPlanWorkspaceMyTask);
            dashboardDetails.setProfessionalPlanCustomerViewMyTask(professionalPlanCustomerViewMyTask);
            dashboardDetails.setPendingTasks(buildPendingTasks(
                    sentOrdersCount,
                    dashboardCount,
                    doctorRole,
                    professionalPlanWorkspaceMyTask,
                    practiceConnectedToOrgMyTask,
                    growthAndStarterPlanMyTask,
                    professionalPlanCustomerViewMyTask,
                    userProfile.getProfileType()));
            dashboardDetails.setPracticeConnectedToOrgMyTask(practiceConnectedToOrgMyTask);
            dashboardDetails.setGrowthAndStarterPlanMyTask(growthAndStarterPlanMyTask);

            dashboardDetails.setLabelName(buildLabels(request.getProfileId(), false));
        }

        response.setDashboardDetails(dashboardDetails);
        return response;
    }

    private static long getTotalPending(OrdersCountResponse sentOrdersCount) {
        Long unassignedOrders = sentOrdersCount.getTask().getUnassignedOrders();
        Long inProgress = sentOrdersCount.getTask().getInProgress();
        Long reviewAssignedOrdersToMe = sentOrdersCount.getTask().getReviewAssignedOrdersToMe();

        return (unassignedOrders != null ? unassignedOrders : 0L)
                + (inProgress != null ? inProgress : 0L)
                + (reviewAssignedOrdersToMe != null ? reviewAssignedOrdersToMe : 0L);
    }

    private record GrowthMetrics(
            Double sentGrowth,
            Double receivedGrowth,
            Double sentGrowthForPractice,
            Double receivedGrowthForPractice,
            Double sentGrowthForCustomer,
            Double receivedGrowthForCustomer) {}

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

    private DoctorDashboardResponse.UserInfo buildUserInfo(Long profileId) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(DoctorNotFoundException::new);

        var userInfo = new DoctorDashboardResponse.UserInfo();
        userInfo.setDisplayName(userProfile.getUser().displayName());
        userInfo.setProfileId(profileId.toString());
        return userInfo;
    }

    private DoctorDashboardResponse.PatientsSummary buildPatientsSummary(DoctorDashboardCount dashboardCount) {
        return DoctorDashboardResponse.PatientsSummary.from(dashboardCount);
    }

    private DoctorDashboardResponse.Summary buildSummary(int total) {
        return DoctorDashboardResponse.Summary.from(total);
    }

    private DoctorDashboardResponse.ActivePracticeOrders buildActivePracticeOrders(
            OrdersCountResponse receivedOrderCount, Double receivedGrowth) {
        return DoctorDashboardResponse.ActivePracticeOrders.from(receivedOrderCount.getCount(), receivedGrowth);
    }

    private DoctorDashboardResponse.OrdersSent buildOrdersSent(
            OrdersCountResponse sentOrdersCount, Double sentGrowth, Integer totalOngoing) {
        return DoctorDashboardResponse.OrdersSent.from(sentOrdersCount.getCount(), sentGrowth, totalOngoing);
    }

    private DoctorDashboardResponse.OrdersReceived buildOrdersReceived(
            OrdersCountResponse receivedOrderCount, Double receivedGrowth) {
        return DoctorDashboardResponse.OrdersReceived.from(receivedOrderCount.getCount(), receivedGrowth);
    }

    private DoctorDashboardResponse.ActiveOrdersSent buildActiveOrdersSent(OrdersCountResponse sentOrdersCount) {
        return DoctorDashboardResponse.ActiveOrdersSent.from(sentOrdersCount.getCount());
    }

    private DoctorDashboardResponse.ActiveOrdersSent buildActiveOrdersSentForEnterprise(
            OrdersCountResponse sentOrdersCount) {
        return DoctorDashboardResponse.ActiveOrdersSent.from(sentOrdersCount.getCount());
    }

    private DoctorDashboardResponse.ActiveCustomerOrders buildActiveCustomerOrders(
            OrdersCountResponse receivedOrdersCount) {
        return DoctorDashboardResponse.ActiveCustomerOrders.from(receivedOrdersCount.getCount());
    }

    private DoctorDashboardResponse.OngoingOrders buildOngoingOrders(OrdersCountResponse sentOrdersCount) {
        return DoctorDashboardResponse.OngoingOrders.from(sentOrdersCount.getCount());
    }

    private DoctorDashboardResponse.PatientCompliance buildPatientCompliance(DoctorDashboardCount dashboardCount) {
        return DoctorDashboardResponse.PatientCompliance.from(dashboardCount.getPatientCompliance());
    }

    private DoctorDashboardResponse.ProfessionalPlanWorkspaceMyTask buildWorkspaceTask(
            OrdersCountResponse receivedOrderCount) {
        return DoctorDashboardResponse.ProfessionalPlanWorkspaceMyTask.from(receivedOrderCount);
    }

    private DoctorDashboardResponse.LabMetrics buildWorkspaceTaskForCustomer(OrdersCountResponse receivedOrderCount) {
        return DoctorDashboardResponse.LabMetrics.from(receivedOrderCount);
    }

    private DoctorDashboardResponse.ProfessionalPlanCustomerViewMyTask buildCustomerViewTask(
            OrdersCountResponse sentOrderCount) {
        return DoctorDashboardResponse.ProfessionalPlanCustomerViewMyTask.from(sentOrderCount);
    }

    private DoctorDashboardResponse.PendingTasks buildPendingTasks(
            OrdersCountResponse sentOrdersCount,
            DoctorDashboardCount dashboardCount,
            DoctorRole doctorRole,
            DoctorDashboardResponse.ProfessionalPlanWorkspaceMyTask professionalPlanWorkspaceMyTask,
            DoctorDashboardResponse.PracticeConnectedToOrgMyTask practiceConnectedToOrgMyTask,
            DoctorDashboardResponse.GrowthAndStarterPlanMyTask growthAndStarterPlanMyTask,
            DoctorDashboardResponse.ProfessionalPlanCustomerViewMyTask professionalPlanCustomerViewMyTask,
            ProfileType profileType) {
        return DoctorDashboardResponse.PendingTasks.from(
                sentOrdersCount,
                dashboardCount,
                doctorRole,
                professionalPlanWorkspaceMyTask,
                practiceConnectedToOrgMyTask,
                growthAndStarterPlanMyTask,
                professionalPlanCustomerViewMyTask,
                profileType);
    }

    private DoctorDashboardResponse.PracticeConnectedToOrgMyTask buildPracticeConnectedTask(
            DoctorDashboardCount dashboardCount, OrdersCountResponse sentOrdersCount) {
        return DoctorDashboardResponse.PracticeConnectedToOrgMyTask.from(dashboardCount, sentOrdersCount);
    }

    private DoctorDashboardResponse.GrowthAndStarterPlanMyTask buildGrowthStarterTask(
            DoctorDashboardCount dashboardCount, OrdersCountResponse sentOrdersCount) {
        return DoctorDashboardResponse.GrowthAndStarterPlanMyTask.from(dashboardCount, sentOrdersCount);
    }

    private DoctorDashboardResponse.LabelName buildLabels(Long profileId, boolean isEnterprise) {
        var dashboardLabels = dashboardLabelRepository.findByProfileId(profileId);
        if (dashboardLabels.isPresent()) {
            return DoctorDashboardResponse.LabelName.from(dashboardLabels.get());
        }
        if (isEnterprise) {
            return DoctorDashboardResponse.LabelName.enterprisePlanName();
        }
        return DoctorDashboardResponse.LabelName.from();
    }

    private Double calculateGrowthPercentage(Long thisMonthCount, Long lastMonthCount) {
        if (lastMonthCount == null || lastMonthCount == 0) {
            return 0.0;
        }
        double growth = ((double) (thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
        return Math.round(growth * 10.0) / 10.0;
    }

    @Override
    public DashboardCounts getCount(Long doctorId) {
        Long practiceLocationCount = doctorService.getPracticeLocationCount(doctorId);
        DashboardCounts dashboardCounts = new DashboardCounts();
        dashboardCounts.setPracticeLocationCount(practiceLocationCount);
        long newActivePatient = 0L;
        int totalNewPatient = 0;

        try {
            var patientCount = activePatient(doctorId);
            dashboardCounts.setNewActivePatient(patientCount.getNewActivePatient());
            dashboardCounts.setTotalNewPatient(patientCount.getTotalNewPatient());
        } catch (Exception e) {
            dashboardCounts.setNewActivePatient(newActivePatient);
            dashboardCounts.setTotalNewPatient(totalNewPatient);
        }
        return dashboardCounts;
    }

    @Override
    public List<DoctorPatientDetails> getPatientDetails(DoctorRequestForPatientDetails request) {

        List<Long> patientIds;
        List<AlignerJourney> alignerJourneys;
        var organizationId = request.getOrganizationId();
        var doctorId = request.getDoctorId();
        var profileId = request.getProfileId();
        UserProfile userProfile = userProfileRepository
                .findByIdWithRoles(request.getProfileId())
                .orElseThrow(DoctorNotFoundException::new);
        if (request.getProfileId() != null && request.getOrganizationId() != null) {
            if (!request.getIsFromChat()) {
                if (isAlignerCompanyOrLab(userProfile.getRoles())
                        || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
                    patientIds = patientDoctorOrganizationRepository.findPatientIdsByOrganizationId(
                            request.getOrganizationId());
                } else {
                    patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                            doctorId, organizationId, profileId);
                }
            } else {
                patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                        doctorId, organizationId, profileId);
            }

            Set<Long> patientIdsSet = new HashSet<>(patientIds);
            alignerJourneys = alignerJourneyRepository.findByPatientIds(patientIdsSet);
            patientIds = alignerJourneys.stream()
                    .map(aj -> aj.getPatient().getId())
                    .distinct()
                    .toList();
        } else {
            alignerJourneys = alignerJourneyRepository.findByDoctorId(request.getDoctorId());
            patientIds = alignerJourneys.stream()
                    .map(aj -> aj.getPatient().getId())
                    .distinct()
                    .toList();
            patientIds = filterPatientIdsByStatus(patientIds, request.getPatientStatus(), alignerJourneys);
        }

        Set<Long> patientIdSet = new HashSet<>(patientIds);

        Map<Long, TreatmentPlanSummary> treatmentPlanMap =
                treatmentPlanRepository
                        .findLatestNonDraftTreatmentPlansByPatientIds(patientIdSet, ProductTypeName.ALIGNERS)
                        .stream()
                        .collect(Collectors.toMap(TreatmentPlanSummary::getPatientId, tp -> tp, (a, b) -> a));

        Set<Long> yourPatientIds = Collections.emptySet();
        if (request.getProfileId() != null && request.getOrganizationId() != null) {
            yourPatientIds = new HashSet<>(patientDoctorOrganizationRepository.findYourPatientIds(
                    request.getDoctorId(), patientIdSet, request.getProfileId(), request.getOrganizationId()));
        }

        Map<Long, PatientInvitationStatusSummary> invitationStatusMap =
                invitationRepository.findLatestInvitationStatusByPatientIds(patientIdSet).stream()
                        .collect(Collectors.toMap(PatientInvitationStatusSummary::getPatientId, s -> s, (a, b) -> a));

        List<DoctorPatientDetails> doctorPatientDetailList = new ArrayList<>();
        for (Long patientId : patientIds) {
            Patient patient = getPatientFromAlignerJourneys(patientId, alignerJourneys);

            var latestDeactivatedTreatmentPlan = Optional.ofNullable(treatmentPlanMap.get(patient.getId()));

            List<AlignerJourney> alignerJourneyList = alignerJourneys.stream()
                    .filter(aj -> aj.getPatient().getId().equals(patient.getId()))
                    .toList();

            alignerJourneyList = filterAlignerJourneys(alignerJourneyList, request);

            AlignerJourney lastAddedAlignerJourney = getLastAddedAlignerJourney(alignerJourneyList);
            if (lastAddedAlignerJourney != null && lastAddedAlignerJourney.getDoctorTreatmentStartDate() != null) {
                var practiceAssigned = patient.getDoctorOrganization().isPracticeAssigned();
                boolean isYourPatient = yourPatientIds.contains(patient.getId());
                var invStatus = invitationStatusMap.get(patientId);
                AppInviteStatus appInviteStatus = (invStatus != null)
                        ? convertToAppInviteStatusFromBatch(invStatus)
                        : AppInviteStatus.NOT_CONNECTED;
                DoctorPatientDetails doctorPatientDetails = createDoctorPatientDetails(
                        patient,
                        lastAddedAlignerJourney,
                        request,
                        latestDeactivatedTreatmentPlan.orElse(null),
                        practiceAssigned,
                        isYourPatient,
                        appInviteStatus);
                doctorPatientDetailList.add(doctorPatientDetails);
            }
        }

        if (request.getPatientListType().equals(PatientListType.PENDING)) {
            getWithoutAlignerJourneyPendingPatient(request, doctorPatientDetailList, userProfile);
        }

        return doctorPatientDetailList;
    }

    private AppInviteStatus convertToAppInviteStatus(InvitationStatusSummary invitationStatus) {
        if (invitationStatus == null) {
            return AppInviteStatus.NOT_CONNECTED;
        }

        if (invitationStatus.getStatus() == InvitationStatus.ACCEPTED) {
            return AppInviteStatus.CONNECTED;
        } else if (invitationStatus.getStatus() == InvitationStatus.SENT
                && Boolean.TRUE.equals(invitationStatus.getIsInvitationSent())) {
            return AppInviteStatus.PENDING;
        }

        return AppInviteStatus.NOT_CONNECTED;
    }

    private AppInviteStatus convertToAppInviteStatusFromBatch(PatientInvitationStatusSummary invitationStatus) {
        if (invitationStatus == null) {
            return AppInviteStatus.NOT_CONNECTED;
        }

        if (invitationStatus.getStatus() == InvitationStatus.ACCEPTED) {
            return AppInviteStatus.CONNECTED;
        } else if (invitationStatus.getStatus() == InvitationStatus.SENT
                && Boolean.TRUE.equals(invitationStatus.getIsInvitationSent())) {
            return AppInviteStatus.PENDING;
        }

        return AppInviteStatus.NOT_CONNECTED;
    }

    private List<Long> filterPatientIdsByStatus(
            List<Long> patientIds, PatientStatus patientStatus, List<AlignerJourney> alignerJourneys) {
        if (patientStatus.equals(PatientStatus.ALL)) {
            return patientIds;
        } else {
            return alignerJourneys.stream()
                    .filter(aj -> patientIds.contains(aj.getPatient().getId()))
                    .map(aj -> aj.getPatient().getId())
                    .distinct()
                    .toList();
        }
    }

    private Patient getPatientFromAlignerJourneys(Long patientId, List<AlignerJourney> alignerJourneys) {
        return alignerJourneys.stream()
                .map(AlignerJourney::getPatient)
                .filter(patient -> patient.getId().equals(patientId))
                .findFirst()
                .orElseThrow(() -> new PatientNotFoundException("Patient not found in aligner journeys"));
    }

    private void getWithoutAlignerJourneyPendingPatient(
            DoctorRequestForPatientDetails request,
            List<DoctorPatientDetails> doctorPatientDetailList,
            UserProfile userProfile) {

        List<Patient> patients = getPatientsByRole(request, userProfile);
        List<Long> patientIds = patients.stream().map(Patient::getId).collect(Collectors.toList());

        List<Tracking> trackings =
                trackingRepository.findAllDraftTrackingWithAskPatientToFill(Status.DRAFT, patientIds);

        Map<Long, Tracking> trackingMap =
                trackings.stream().collect(Collectors.toMap(Tracking::getPatientId, tracking -> tracking, (a, b) -> a));

        for (Patient patient : patients) {
            if (!patient.getPatientStatus().equals(PatientStatus.ARCHIVE)) {
                Tracking tracking = trackingMap.get(patient.getId());
                if (tracking != null && request.getPatientListType().equals(PatientListType.PENDING)) {
                    var latestDeactivatedTreatmentPlan = treatmentPlanRepository
                            .findLatestNonDraftTreatmentPlan(patient.getId(), ProductTypeName.ALIGNERS)
                            .orElse(null);

                    AppInviteStatus appInviteStatus = invitationRepository
                            .findLatestInvitationStatusByPatientId(patient.getId())
                            .map(this::convertToAppInviteStatus)
                            .orElse(AppInviteStatus.NOT_CONNECTED);
                    DoctorPatientDetails doctorPatientDetails = createBasicDoctorPatientDetails(
                            patient, tracking, request, latestDeactivatedTreatmentPlan, appInviteStatus);
                    doctorPatientDetailList.add(doctorPatientDetails);
                }
            }
        }
    }

    private boolean isAlignerCompanyOrLab(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.ALIGNER_COMPANY_OR_LAB.name())
                        || roleName.equals(DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
    }

    @Nullable
    private DoctorRole getMatchingDoctorRole(Set<Role> roles) {
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
                .filter(role -> switch (role) {
                    case ALIGNER_COMPANY_OR_LAB, ENTERPRISE_COMPANY_LAB, COMMERCIAL_ALIGNER_LAB, LAB_STAFF -> true;
                    default -> false;
                })
                .findFirst()
                .orElse(null);
    }

    private List<Patient> getPatientsByRole(DoctorRequestForPatientDetails request, UserProfile userProfile) {

        if (request.getProfileId() == null || request.getOrganizationId() == null) {
            return patientRepository.findByAddedByUserId(request.getDoctorId());
        }

        if (isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            return patientDoctorOrganizationRepository.findPatientsByOrganizationId(request.getOrganizationId());
        }

        return patientDoctorOrganizationRepository.findPatientsByDoctorOrgAndProfile(
                request.getDoctorId(), request.getOrganizationId(), request.getProfileId());
    }

    private DoctorPatientDetails createBasicDoctorPatientDetails(
            Patient patient,
            Tracking tracking,
            DoctorRequestForPatientDetails doctorRequestForPatientDetails,
            TreatmentPlanSummary treatmentPlanSummary,
            AppInviteStatus appInviteStatus) {

        AlignerTreatmentStage treatmentStage = determineAlignerTreatmentStage(treatmentPlanSummary, tracking, null);

        DoctorPatientDetails doctorPatientDetails = new DoctorPatientDetails();
        doctorPatientDetails.setPatientId(patient.getId());
        doctorPatientDetails.setPatientName(patient.fullName());
        doctorPatientDetails.setMobile(patient.getMobileNo());
        doctorPatientDetails.setCountryCode(patient.getCountryCode());
        doctorPatientDetails.setPatientProfile(patient.getProfilePictureUrl());
        doctorPatientDetails.setAppInviteStatus(appInviteStatus);
        doctorPatientDetails.setAlignerTreatmentStage(treatmentStage);
        doctorPatientDetails.setLatestDeactivatedDate(
                treatmentPlanSummary != null ? treatmentPlanSummary.getDeactivatedAt() : null);
        doctorPatientDetails.setTreatmentDeactivatedReason(
                treatmentPlanSummary != null ? treatmentPlanSummary.getTreatmentDeactivatedReason() : null);
        doctorPatientDetails.setTreatmentDeactivatedRemark(
                treatmentPlanSummary != null ? treatmentPlanSummary.getTreatmentDeactivatedRemark() : null);

        if (tracking != null) {
            doctorPatientDetails.setStatus(tracking.getTreatmentPlan().getStatus());
            doctorPatientDetails.setTreatmentPauseDate(tracking.getPauseDate());
            doctorPatientDetails.setTreatmentCompleteDate(tracking.getUpdatedAt());
        }

        doctorPatientDetails.setPracticeLocationName(patient.getPracticeLocationName());
        doctorPatientDetails.setEmail(patient.getEmail());

        if (doctorRequestForPatientDetails.getPatientListType().equals(PatientListType.PENDING)) {
            assert tracking != null;
            if (tracking.getIsPatientConnected() != null
                    && tracking.getIsPatientConnected().equals(false)) {
                doctorPatientDetails.setPendingPatientStatus(PatientPendingStatus.CONNECTION_PENDING);
            } else if (tracking.getPatientDataFillStatus() != null
                    && tracking.getPatientDataFillStatus().equals(PatientDataFillStatus.ASK_PATIENT_TO_FILL)) {
                doctorPatientDetails.setPendingPatientStatus(PatientPendingStatus.AWAITING_DATA_FROM_PATIENT);
            }
        }
        return doctorPatientDetails;
    }

    private List<AlignerJourney> filterAlignerJourneys(
            List<AlignerJourney> alignerJourneyList, DoctorRequestForPatientDetails doctorRequestForPatientDetails) {

        alignerJourneyList = alignerJourneyList.stream()
                .filter(alignerJourney -> alignerJourney.getProgressStatus().equals(ProgressStatus.IN_PROGRESS)
                        || alignerJourney.getProgressStatus().equals(ProgressStatus.NOT_STARTED)
                        || alignerJourney.getProgressStatus().equals(ProgressStatus.DEACTIVATED))
                .toList();

        if (doctorRequestForPatientDetails.getPatientListType().equals(PatientListType.ALL)) {
            final List<AlignerJourney> finalAlignerJourneyList = new ArrayList<>(alignerJourneyList);
            return finalAlignerJourneyList.stream()
                    .filter(alignerJourney -> {
                        Tracking tracking = alignerJourney.getTracking();
                        if (tracking == null) {
                            return false;
                        }

                        if (tracking.getTrackingType().equals(TrackingType.MANUAL)) {

                            boolean hasPatientApp = finalAlignerJourneyList.stream()
                                    .anyMatch(aj -> aj.getPatient()
                                                    .getId()
                                                    .equals(alignerJourney
                                                            .getPatient()
                                                            .getId())
                                            && aj.getTracking() != null
                                            && aj.getTracking()
                                                    .getTrackingType()
                                                    .equals(TrackingType.PATIENTAPP));

                            if (hasPatientApp) {
                                return false;
                            }
                        }

                        return (Boolean.TRUE.equals(tracking.getIsPatientConnected())
                                || tracking.getIsPatientConnected() == null
                                || tracking.getTrackingType().equals(TrackingType.MANUAL));
                    })
                    .collect(Collectors.toList());
        }

        if (doctorRequestForPatientDetails.getPatientListType().equals(PatientListType.MANUAL)) {
            final List<AlignerJourney> finalAlignerJourneyList = new ArrayList<>(alignerJourneyList);
            return finalAlignerJourneyList.stream()
                    .filter(alignerJourney -> {
                        Tracking tracking = alignerJourney.getTracking();
                        return tracking != null
                                && tracking.getTrackingType().equals(TrackingType.MANUAL)
                                && finalAlignerJourneyList.stream()
                                        .noneMatch(aj -> aj.getPatient()
                                                        .getId()
                                                        .equals(alignerJourney
                                                                .getPatient()
                                                                .getId())
                                                && aj.getTracking() != null
                                                && aj.getTracking()
                                                        .getTrackingType()
                                                        .equals(TrackingType.PATIENTAPP));
                    })
                    .collect(Collectors.toList());
        }

        if (doctorRequestForPatientDetails.getPatientListType().equals(PatientListType.PATIENTAPP)) {
            return alignerJourneyList.stream()
                    .filter(alignerJourney -> {
                        Tracking tracking = alignerJourney.getTracking();
                        return tracking != null
                                && tracking.getTrackingType().equals(TrackingType.PATIENTAPP)
                                && Boolean.TRUE.equals(tracking.getIsPatientConnected());
                    })
                    .collect(Collectors.toList());
        }

        if (doctorRequestForPatientDetails.getPatientListType().equals(PatientListType.PENDING)) {
            return alignerJourneyList.stream()
                    .filter(alignerJourney -> {
                        Tracking tracking = alignerJourney.getTracking();
                        return tracking != null
                                && Boolean.FALSE.equals(tracking.getIsPatientConnected())
                                && !tracking.getTrackingType().equals(TrackingType.MANUAL);
                    })
                    .collect(Collectors.toList());
        }

        return alignerJourneyList;
    }

    private AlignerJourney getLastAddedAlignerJourney(List<AlignerJourney> alignerJourneyList) {
        return alignerJourneyList.stream()
                .max(Comparator.comparing(AlignerJourney::getCreatedAt))
                .orElse(null);
    }

    private DoctorPatientDetails createDoctorPatientDetails(
            Patient patient,
            AlignerJourney alignerJourney,
            DoctorRequestForPatientDetails doctorRequestForPatientDetails,
            TreatmentPlanSummary treatmentPlanSummary,
            Boolean isPracticeAssigned,
            Boolean isYourPatient,
            AppInviteStatus appInviteStatus) {

        AlignerTreatmentStage treatmentStage =
                determineAlignerTreatmentStage(treatmentPlanSummary, alignerJourney.getTracking(), alignerJourney);

        DoctorPatientDetails doctorPatientDetails = new DoctorPatientDetails();
        doctorPatientDetails.setPatientId(patient.getId());
        doctorPatientDetails.setPatientName(patient.fullName());
        doctorPatientDetails.setMobile(patient.getMobileNo());
        doctorPatientDetails.setCountryCode(patient.getCountryCode());
        doctorPatientDetails.setPatientProfile(patient.getProfilePictureUrl());
        doctorPatientDetails.setIsPracticeAssigned(isPracticeAssigned);
        doctorPatientDetails.setIsYourPatient(isYourPatient);
        doctorPatientDetails.setPatientAddedOn(patient.getCreatedAt());
        doctorPatientDetails.setPatientBelongsTo(patient.getDoctorOrganization().getPatientBelongsTo());
        doctorPatientDetails.setAppInviteStatus(appInviteStatus);
        doctorPatientDetails.setAlignerTreatmentStage(treatmentStage);

        doctorPatientDetails.setAlignerJourneyId(alignerJourney.getId());
        if (alignerJourney.getTracking() != null) {
            doctorPatientDetails.setStatus(
                    alignerJourney.getTracking().getTreatmentPlan().getStatus());
        }
        doctorPatientDetails.setProgressStatus(alignerJourney.getProgressStatus());
        doctorPatientDetails.setTreatmentStartDate(alignerJourney.getDoctorTreatmentStartDate());

        Aligner currentAligner = alignerJourney.getCurrentAligner();
        if (currentAligner != null) {
            doctorPatientDetails.setCurrentAligner(currentAligner.getJawType() + " " + currentAligner.getSrNo() + " of "
                    + alignerJourney.totalAligners());
            doctorPatientDetails.setCurrentAlignerCompliance(
                    alignerJourney.getTracking() != null
                                    && alignerJourney
                                            .getTracking()
                                            .getTrackingType()
                                            .equals(TrackingType.MANUAL)
                            ? null
                            : alignerJourney.getCurrentAligner().compliance());
            doctorPatientDetails.setBrandName(alignerJourney.getBrand());
        }
        doctorPatientDetails.setCurrentAlignerStartDate(currentAligner.getStartDate());
        doctorPatientDetails.setCurrentAlignerEndDate(currentAligner.getEndDate());
        doctorPatientDetails.setDaysRemaining(alignerJourney.daysRemainingOnCurrentAligner());
        doctorPatientDetails.setLatestDeactivatedDate(
                treatmentPlanSummary != null ? treatmentPlanSummary.getDeactivatedAt() : null);
        doctorPatientDetails.setTreatmentDeactivatedReason(
                treatmentPlanSummary != null ? treatmentPlanSummary.getTreatmentDeactivatedReason() : null);
        doctorPatientDetails.setTreatmentDeactivatedRemark(
                treatmentPlanSummary != null ? treatmentPlanSummary.getTreatmentDeactivatedRemark() : null);

        doctorPatientDetails.setPatientProfile(patient.getProfilePictureUrl());
        doctorPatientDetails.setPracticeLocationName(patient.getPracticeLocationName());
        doctorPatientDetails.setCountryCode(patient.getCountryCode());
        doctorPatientDetails.setTreatmentPauseDate(alignerJourney.getTracking().getPauseDate());
        doctorPatientDetails.setEmail(patient.getEmail());
        if (alignerJourney.getProgressStatus() != null) {
            doctorPatientDetails.setTreatmentCompleteDate(
                    alignerJourney.getTracking().getUpdatedAt());
        }

        if (doctorRequestForPatientDetails.getPatientListType().equals(PatientListType.PENDING)) {
            assert alignerJourney.getTracking().getIsPatientConnected() != null;
            if (alignerJourney.getTracking().getIsPatientConnected().equals(false)) {
                doctorPatientDetails.setPendingPatientStatus(PatientPendingStatus.CONNECTION_PENDING);
            } else {
                assert alignerJourney.getTracking().getPatientDataFillStatus() != null;
                if (alignerJourney
                        .getTracking()
                        .getPatientDataFillStatus()
                        .equals(PatientDataFillStatus.ASK_PATIENT_TO_FILL)) {
                    doctorPatientDetails.setPendingPatientStatus(PatientPendingStatus.AWAITING_DATA_FROM_PATIENT);
                } else {
                    doctorPatientDetails.setPendingPatientStatus(
                            PatientPendingStatus.FUTURE_TREATMENT + alignerJourney.getPatientTreatmentStartDate());
                }
            }
        }
        return doctorPatientDetails;
    }

    private AlignerTreatmentStage determineAlignerTreatmentStage(
            TreatmentPlanSummary latestDeactivatedTreatmentPlan,
            Tracking tracking,
            @Nullable AlignerJourney alignerJourney) {

        if (alignerJourney == null
                || alignerJourney.getDoctorTreatmentStartDate().isAfter(LocalDate.now())) {
            return AlignerTreatmentStage.STARTING_SOON;
        }
        if (latestDeactivatedTreatmentPlan != null
                && latestDeactivatedTreatmentPlan.getStatus().equals(AlignerTreatmentStatus.DEACTIVATED)) {
            return AlignerTreatmentStage.REFINEMENT;
        }

        if (tracking != null && tracking.getTreatmentPlan().getStatus() == AlignerTreatmentStatus.PAUSED) {
            return AlignerTreatmentStage.PAUSED;
        }

        return AlignerTreatmentStage.ONGOING;
    }

    @Override
    public List<PatientResponse> getPatinetList(List<Long> patientIds) {

        List<PatientResponse> patientResponseList = new ArrayList<>();
        for (Long patientId : patientIds) {
            Optional<Patient> patient = patientRepository.findById(patientId);

            if (patient.isPresent()) {
                PatientResponse patientResponse = new PatientResponse();
                patientResponse.setFirstName(patient.get().getFirstName());
                patientResponse.setLastName(patient.get().getLastName());
                patientResponse.setPatientId(patientId);
                patientResponse.setMobileNo(patient.get().getMobileNo());
                patientResponse.setProfileImage(patient.get().getProfilePictureUrl());
                patientResponse.setEmail(patient.get().getEmail());
                patientResponse.setPatientCode(patient.get().getUUID());
                patientResponse.setPatientFullName(patient.get().fullName());
                List<Address> addresses = patient.get().getAddresses();

                if (!addresses.isEmpty()) {
                    Address lastAddress = addresses.get(addresses.size() - 1);
                    patientResponse.setCity(lastAddress.getCity());
                }

                patientResponseList.add(patientResponse);
            }
        }
        return patientResponseList;
    }

    @Override
    public ChatPatientResponse getPatientForChat(Long patientId) {
        Optional<Patient> patient = patientRepository.findById(patientId);
        ChatPatientResponse patientResponse = new ChatPatientResponse();
        if (patient.isPresent()) {
            patientResponse.setFirstName(patient.get().getFirstName());
            patientResponse.setLastName(patient.get().getLastName());
            patientResponse.setPatientId(patientId);
            patientResponse.setProfileImage(patient.get().getProfilePictureUrl());
            patientResponse.setMobile(patient.get().getMobileNo());
            patientResponse.setEmail(patient.get().getEmail());
        }
        return patientResponse;
    }

    @Override
    public List<WaitingListPatientResponse> getWaitingListPatient(Long doctorId) {
        return patientRepository.findByDoctorIdAndPatientStatus(doctorId, PatientStatus.ACTIVE).stream()
                .flatMap(patient -> alignerJourneyRepository.findByPatientId(patient.getId()).stream())
                .filter(alignerJourney -> alignerJourney.getProgressStatus().equals(ProgressStatus.NOT_STARTED)
                        || (alignerJourney.shouldAskPatientForCurrentAlignerNo()
                                && alignerJourney.shouldAskPatientForTreatmentStartDate()))
                .map(WaitingListPatientResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<WaitingListPatientResponse> getWaitingListPatientNew(Long doctorId) {
        return patientRepository.findByDoctorIdAndPatientStatus(doctorId, PatientStatus.ACTIVE).stream()
                .flatMap(patient -> alignerJourneyRepository.findByPatientId(patient.getId()).stream())
                .filter(alignerJourney -> alignerJourney.getProgressStatus().equals(ProgressStatus.NOT_STARTED)
                        || (alignerJourney.shouldAskPatientForCurrentAlignerNo()
                                && alignerJourney.shouldAskPatientForTreatmentStartDate()))
                .map(alignerJourney -> {
                    var patientInvitationDetails = patientInvitationDetailsRepository.findByPatientId(
                            alignerJourney.getPatient().getId());
                    WaitingListPatientResponse response;
                    Aligner firstAligner = alignerJourney.getAligner(1);
                    response = patientInvitationDetails
                            .map(invitationDetails ->
                                    WaitingListPatientResponse.from(alignerJourney, invitationDetails, firstAligner))
                            .orElseGet(() -> WaitingListPatientResponse.from(alignerJourney));
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public MobileDashboardDoctorDetails getDoctorMobileDashboardData(Long doctorId) {
        List<AllInvitationDetailsForMobile> sentInvitations = invitationService.getMobileLeadData(doctorId);
        List<BracesJourneyDetails> bracesJourneyDetails =
                bracesJourneyService.getBracesJourneyDetailsForDashboard(doctorId);

        MobileDashboardDoctorDetails response = new MobileDashboardDoctorDetails();
        response.setBracesJourneyDetails(bracesJourneyDetails);
        response.setSentInvitations(sentInvitations);
        return response;
    }

    @Override
    public List<DashboardLeadDetails> getWebLeadData(Long doctorId) {
        List<InvitationStatus> statusList = Arrays.asList(InvitationStatus.ACCEPTED, InvitationStatus.SENT);
        List<Invitation> invitations =
                invitationRepository.findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusIn(
                        doctorId, UserType.DOCTOR, UserType.PATIENT, statusList);

        List<DashboardLeadDetails> dashboardLeadDetails = new ArrayList<>();
        for (Invitation invitation : invitations) {
            if (invitation.getPatientInvitation() == null) {
                continue;
            }
            Patient patient = invitation.getPatientInvitation().getPatient();
            var bracesJourneyOptional = bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(
                    patient.getId(), BracesTreatmentStage.ACTIVE);

            if (patient.getProductTypeNames().contains(ProductTypeName.ALIGNERS)) {
                if (alignerJourneyRepository.findByPatientId(patient.getId()).isEmpty()) {
                    dashboardLeadDetails.add(DashboardLeadDetails.from(invitation));
                }
            } else {
                if (bracesJourneyOptional.isEmpty()
                        || !bracesJourneyOptional.get().getIsTreatmentStarted()) {
                    dashboardLeadDetails.add(DashboardLeadDetails.from(invitation));
                }
            }
        }
        return dashboardLeadDetails;
    }

    @Override
    public DoctorDashboardCount getDashboardCount(Long doctorId, Long organizationId, Long profileId) {
        List<Long> patientIds;

        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(DoctorNotFoundException::new);

        int practiceCount = 0;
        int labCount = 0;
        int activePracticeCount = 0;
        int activeCustomerCount = 0;

        if (isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            InvitationCountsProjection counts = doctorInvitationRepository.countAllInvitations(
                    doctorId,
                    organizationId,
                    List.of(InvitationRole.CONSULTING_ORTHODONTIST),
                    List.of(InvitationRole.CUSTOMER),
                    List.of(InvitationRole.VENDOR, InvitationRole.COMMERCIAL_ALIGNER_LAB),
                    List.of(InvitationRole.VENDOR));

            practiceCount = counts.getPracticeCount() != null ? counts.getPracticeCount() : 0;
            activePracticeCount = counts.getActivePracticeCount() != null ? counts.getActivePracticeCount() : 0;
            activeCustomerCount = counts.getActiveCustomerCount() != null ? counts.getActiveCustomerCount() : 0;
            Integer labSentCount = counts.getLabSentCount() != null ? counts.getLabSentCount() : 0;
            Integer labReceivedCount = counts.getLabReceivedCount() != null ? counts.getLabReceivedCount() : 0;
            labCount = labReceivedCount + labSentCount;
            patientIds =
                    patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdWithoutArchive(organizationId);
        } else {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfileWithoutArchive(
                    doctorId, organizationId, profileId);
        }
        return getDashboardCount(
                patientIds,
                doctorId,
                organizationId,
                labCount,
                practiceCount,
                profileId,
                userProfile,
                activePracticeCount,
                activeCustomerCount);
    }

    @Override
    public DoctorDashboardCount getDashboardCountForPatientMetrics(Long doctorId, Long organizationId, Long profileId) {
        List<Long> patientIds;

        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(DoctorNotFoundException::new);

        int practiceCount = 0;
        int labCount = 0;
        int activePracticeCount = 0;
        int activeCustomerCount = 0;

        if (isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            InvitationCountsProjection counts = doctorInvitationRepository.countAllInvitations(
                    doctorId,
                    organizationId,
                    List.of(InvitationRole.CONSULTING_ORTHODONTIST),
                    List.of(InvitationRole.CUSTOMER),
                    List.of(InvitationRole.VENDOR, InvitationRole.COMMERCIAL_ALIGNER_LAB),
                    List.of(InvitationRole.VENDOR));

            practiceCount = counts.getPracticeCount() != null ? counts.getPracticeCount() : 0;
            activePracticeCount = counts.getActivePracticeCount() != null ? counts.getActivePracticeCount() : 0;
            activeCustomerCount = counts.getActiveCustomerCount() != null ? counts.getActiveCustomerCount() : 0;
            Integer labSentCount = counts.getLabSentCount() != null ? counts.getLabSentCount() : 0;
            Integer labReceivedCount = counts.getLabReceivedCount() != null ? counts.getLabReceivedCount() : 0;
            labCount = labReceivedCount + labSentCount;
            patientIds =
                    patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdWithoutArchive(organizationId);
        } else {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfileWithoutArchive(
                    doctorId, organizationId, profileId);
        }

        return getDashboardCount(
                patientIds,
                doctorId,
                organizationId,
                labCount,
                practiceCount,
                profileId,
                userProfile,
                activePracticeCount,
                activeCustomerCount,
                false);
    }

    @Override
    public DoctorDashboardCount getDashboardCountForEnterprise(
            Long doctorId, Long organizationId, Long profileId, List<String> role) {
        List<Long> patientIds;

        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(DoctorNotFoundException::new);

        int practiceCount = 0;
        int activePracticeCount = 0;
        int activeCustomerCount = 0;
        int labCount = 0;

        if (isAlignerCompanyOrLab(userProfile.getRoles())) {
            InvitationCountsProjection counts = doctorInvitationRepository.countAllInvitations(
                    doctorId,
                    organizationId,
                    List.of(InvitationRole.CONSULTING_ORTHODONTIST),
                    List.of(InvitationRole.CUSTOMER),
                    List.of(InvitationRole.VENDOR, InvitationRole.COMMERCIAL_ALIGNER_LAB),
                    List.of(InvitationRole.VENDOR));

            practiceCount = counts.getPracticeCount() != null ? counts.getPracticeCount() : 0;
            activePracticeCount = counts.getActivePracticeCount() != null ? counts.getActivePracticeCount() : 0;
            activeCustomerCount = counts.getActiveCustomerCount() != null ? counts.getActiveCustomerCount() : 0;
            Integer labSentCount = counts.getLabSentCount() != null ? counts.getLabSentCount() : 0;
            Integer labReceivedCount = counts.getLabReceivedCount() != null ? counts.getLabReceivedCount() : 0;
            labCount = labReceivedCount + labSentCount;

            if (role != null
                    && role.contains(DoctorRole.CUSTOMER.name())
                            | role.contains(DoctorRole.CONSULTING_ORTHODONTIST.name())) {
                patientIds = patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdAndRoleIdWithoutArchive(
                        organizationId, role);
            } else {
                patientIds = patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdWithoutArchive(
                        organizationId);
            }
        } else {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfileWithoutArchive(
                    doctorId, organizationId, profileId);
        }
        return getDashboardCount(
                patientIds,
                doctorId,
                organizationId,
                labCount,
                practiceCount,
                profileId,
                userProfile,
                activePracticeCount,
                activeCustomerCount);
    }

    public DoctorDashboardCount getDashboardCount(
            List<Long> patientIds,
            Long doctorId,
            Long organizationId,
            int labCount,
            int practiceCount,
            Long profileId,
            UserProfile userProfile,
            int activePracticeCount,
            int activeCustomerCount) {
        return getDashboardCount(
                patientIds,
                doctorId,
                organizationId,
                labCount,
                practiceCount,
                profileId,
                userProfile,
                activePracticeCount,
                activeCustomerCount,
                true);
    }

    private DoctorDashboardCount getDashboardCount(
            List<Long> patientIds,
            Long doctorId,
            Long organizationId,
            int labCount,
            int practiceCount,
            Long profileId,
            UserProfile userProfile,
            int activePracticeCount,
            int activeCustomerCount,
            boolean includeAuxiliaryMetrics) {
        Set<Long> deactivatedPatientIds =
                alignerJourneyRepository.findPatientsWithDeactivatedPlans(new HashSet<>(patientIds));

        Set<Long> remainingPatientIds = new HashSet<>(patientIds);
        remainingPatientIds.removeAll(deactivatedPatientIds);
        List<AlignerJourneySummary> alignerJourneys =
                alignerJourneyRepository.findAlignerJourneySummariesByPatientIds(new HashSet<>(remainingPatientIds));

        long unreadMessageCount = 0L;
        long unreadNotification = 0L;
        int alignerActionCounts = 0;
        int atRiskCount = 0;
        int onTrackCount = 0;
        int needsAttentionCount = 0;
        int totalPatientsForCompliance = 0;

        if (includeAuxiliaryMetrics) {
            unreadMessageCount =
                    !patientIds.isEmpty() ? chatService.getDoctorUnreadMessageCount(doctorId, patientIds) : 0;
            unreadNotification = timelineService.getTotalActiveEventCount(doctorId, userProfile);

            var patientAppTrackingPatientIds = getPatientIds(patientIds);
            Set<Long> patientIdSet = new HashSet<>(patientAppTrackingPatientIds);
            alignerActionCounts = alignerActionRepository.findTotalUnvalidatedActionsForAllPatients(patientIdSet);

            AlignerAnalyticsCounts alignerAnalyticsCounts =
                    alignerAnalyticsQueryRepository.getAlignerAnalyticsCounts(patientAppTrackingPatientIds);
            atRiskCount = alignerAnalyticsCounts.getAtRiskCount() != null ? alignerAnalyticsCounts.getAtRiskCount() : 0;
            onTrackCount =
                    alignerAnalyticsCounts.getOnTrackCount() != null ? alignerAnalyticsCounts.getOnTrackCount() : 0;
            needsAttentionCount = alignerAnalyticsCounts.getNeedsAttentionCount() != null
                    ? alignerAnalyticsCounts.getNeedsAttentionCount()
                    : 0;
            totalPatientsForCompliance =
                    alignerAnalyticsCounts.getTotalPatients() != null ? alignerAnalyticsCounts.getTotalPatients() : 0;
        }

        LocalDate today = LocalDate.now();
        Integer appointmentCounts = null;
        if (includeAuxiliaryMetrics) {
            appointmentCounts = reminderRepository.countByDoctorAndDateAndStatusesAndPurpose(
                    profileId,
                    today,
                    List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED),
                    ReminderPurpose.APPOINTMENT);
        }
        DoctorDashboardCount.TreatmentStageCount alignerCount = DoctorDashboardCount.TreatmentStageCount.init();
        DoctorDashboardCount.TreatmentStageCount allCount = DoctorDashboardCount.TreatmentStageCount.init();
        DoctorDashboardCount.TreatmentStageCount bracesCount = DoctorDashboardCount.TreatmentStageCount.init();
        DoctorDashboardCount.PatientCompliance compliance = DoctorDashboardCount.PatientCompliance.init();
        DoctorDashboardCount.AppointmentCounts appointment = DoctorDashboardCount.AppointmentCounts.init();
        DoctorDashboardCount.AlignerUpdateCounts alignerUpdate = DoctorDashboardCount.AlignerUpdateCounts.init();

        if (appointmentCounts != null) {
            appointment.setTodaysAppointment(appointmentCounts);
        }
        alignerUpdate.setTotal(alignerActionCounts);

        int activePatients = 0;
        Set<Long> activePatientIds = new HashSet<>();
        for (Long patientId : deactivatedPatientIds) {
            alignerCount.incrementRefinement();
            allCount.incrementRefinement();
            activePatients++;
            activePatientIds.add(patientId);
        }

        int inAssessment = 0;
        int inPlanning = 0;
        int trackingPending = 0;
        int completed = 0;
        for (AlignerJourneySummary journey : alignerJourneys) {
            AlignerTreatmentStatus status = journey.getTrackingStatus();
            if (status != null) {

                if (status == AlignerTreatmentStatus.ACTIVE
                        || status == AlignerTreatmentStatus.DEACTIVATED
                        || status == AlignerTreatmentStatus.PAUSED) {
                    activePatients++;
                    activePatientIds.add(journey.getPatientId());

                    if (status == AlignerTreatmentStatus.DEACTIVATED) {
                        inAssessment++;
                    }

                    if (status == AlignerTreatmentStatus.ACTIVE) {
                        if (journey.getDoctorTreatmentStartDate().isAfter(today)) {
                            alignerCount.incrementStartingSoon();
                            allCount.incrementStartingSoon();
                        } else {
                            alignerCount.incrementOngoing();
                            allCount.incrementOngoing();
                        }
                    }
                }

                if (status == AlignerTreatmentStatus.COMPLETE) {
                    alignerCount.incrementCompleted();
                    allCount.incrementCompleted();
                }

                if (status == AlignerTreatmentStatus.PAUSED) {
                    alignerCount.incrementPaused();
                    allCount.incrementPaused();
                }

                alignerCount.incrementTotal();
                allCount.incrementTotal();
            }
        }

        List<BracesJourneySummary> bracesJourneys = bracesJourneyRepository.findBracesJourneySummariesByCriteria(
                new HashSet<>(patientIds), List.of(BracesTreatmentStage.ACTIVE));

        for (BracesJourneySummary braces : bracesJourneys) {
            if (braces.getAppointmentCount() > 0) {
                activePatients++;
                activePatientIds.add(braces.getPatientId());
                bracesCount.incrementOngoing();
                allCount.incrementOngoing();
                bracesCount.incrementTotal();
                allCount.incrementTotal();
            }
        }

        Set<Long> leadPatientIds = new HashSet<>(patientIds);
        leadPatientIds.removeAll(activePatientIds);

        Set<Long> archivedPatientIds = alignerJourneys.stream()
                .filter(journey -> journey.getPatientStatus() == PatientStatus.ARCHIVE)
                .map(AlignerJourneySummary::getPatientId)
                .collect(Collectors.toSet());

        leadPatientIds.removeAll(archivedPatientIds);

        int leadPatients = leadPatientIds.size();

        leadPatientIds.removeAll(deactivatedPatientIds);

        List<TreatmentStageDTOSummery> treatmentStages =
                treatmentPlanRepository.findTreatmentStagesByPatientIds(leadPatientIds);

        for (TreatmentStageDTOSummery stage : treatmentStages) {
            switch (stage.getTreatmentStage()) {
                case "ASSESSMENT" -> inAssessment++;
                case "IN_PLANNING" -> inPlanning++;
                case "ADD_TRACKING" -> trackingPending++;
                case "COMPLETE" -> completed++;
            }
        }

        DoctorDashboardCount.PatientCount patientCount = DoctorDashboardCount.PatientCount.builder()
                .total(patientIds.size())
                .active(activePatients)
                .lead(leadPatients)
                .build();

        DoctorDashboardCount.PracticeCounts practice = DoctorDashboardCount.PracticeCounts.builder()
                .total(practiceCount)
                .totalActivePractice(activePracticeCount)
                .totalActiveCustomer(activeCustomerCount)
                .build();
        DoctorDashboardCount.LabCounts lab =
                DoctorDashboardCount.LabCounts.builder().total(labCount).build();

        DoctorDashboardCount.TreatmentCount leadCount = DoctorDashboardCount.TreatmentCount.builder()
                .total(leadPatients)
                .inAssessment(inAssessment)
                .inPlanning(inPlanning)
                .trackingPending(trackingPending)
                .completed(completed)
                .build();
        if (includeAuxiliaryMetrics) {
            compliance.setAtRisk(atRiskCount);
            compliance.setOnTrack(onTrackCount);
            compliance.setNeedsAttention(needsAttentionCount);
            compliance.setOnTrackPercentage(calculatePercentage(onTrackCount, totalPatientsForCompliance));
        }
        return DoctorDashboardCount.builder()
                .allTreatments(allCount)
                .alignerTreatments(alignerCount)
                .bracesTreatments(bracesCount)
                .unreadChatCount(unreadMessageCount)
                .unreadNotificationCount(unreadNotification)
                .patientCount(patientCount)
                .leadCount(leadCount)
                .patientCompliance(compliance)
                .practiceCounts(practice)
                .labCounts(lab)
                .alignerActionCounts(alignerUpdate)
                .appointmentCounts(appointment)
                .build();
    }

    private List<Long> getPatientIds(List<Long> patientIds) {

        return patientDoctorOrganizationRepository.findPatientIdsByPatientIdsAndTrackingType(
                patientIds, TrackingType.PATIENTAPP, null);
    }

    private double calculatePercentage(Integer numerator, Integer denominator) {
        if (denominator == null || denominator == 0) {
            return 0.0;
        }
        return numerator != null ? (double) numerator / denominator * 100 : 0.0;
    }

    public String rootPath(long userId, @NotNull UserType userType) {
        return Paths.get(userType.name().toLowerCase(), String.valueOf(userId), FILES_FOLDER_NAME)
                .toString();
    }

    private LeadTreatmentStage determineTreatmentStage(Long patientId, Long doctorId) {
        return LeadTreatmentStageResolver.determineTreatmentStage(
                patientId,
                doctorId,
                fileRepository,
                patientRepository,
                caseInformationRepository,
                treatmentPlanRepository,
                bracesJourneyRepository);
    }

    @Override
    public PatientCount activePatient(long doctorId) {
        List<ProductTypeName> treatmentSubTypes = Arrays.asList(ProductTypeName.ALIGNERS, ProductTypeName.BRACES);

        List<TreatmentPlanSummary> treatmentPlans =
                treatmentPlanRepository.findTreatmentPlanSummariesByDoctorIdAndTreatmentSubTypes(
                        doctorId, treatmentSubTypes);

        long active = treatmentPlans.stream()
                .filter(summary -> summary.getStatus() != null)
                .filter(summary -> summary.getStatus() == AlignerTreatmentStatus.ACTIVE)
                .map(TreatmentPlanSummary::getPatientId)
                .distinct()
                .count();

        List<InvitationStatus> statusList = Arrays.asList(InvitationStatus.ACCEPTED, InvitationStatus.SENT);
        List<InvitationSummary> invitations = invitationRepository.findInvitationSummariesByCriteria(
                doctorId, UserType.DOCTOR, UserType.PATIENT, statusList);

        Set<Long> patientIds = invitations.stream()
                .map(InvitationSummary::getPatientId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Collection<BracesTreatmentStage> stages =
                Arrays.asList(BracesTreatmentStage.ACTIVE, BracesTreatmentStage.DISCARDED);
        List<BracesJourneySummary> bracesJourneySummaries =
                bracesJourneyRepository.findBracesJourneySummariesByCriteria(patientIds, stages);

        long activeBracesPatients = bracesJourneySummaries.stream()
                .filter(summary -> summary.getAppointmentCount() > 0)
                .map(BracesJourneySummary::getPatientId)
                .collect(Collectors.toSet())
                .size();

        active += activeBracesPatients;

        return PatientCount.builder()
                .newActivePatient(active)
                .totalNewPatient(invitations.size())
                .build();
    }

    @Override
    public PatientCount activePatient(long doctorId, Long profileId) {

        List<Long> patientIds;

        UserProfile userProfile =
                userProfileRepository.findByIdWithRoles(profileId).orElseThrow(DoctorNotFoundException::new);

        patientIds = patientDoctorOrganizationRepository.findPatientIdsByOrganizationId(
                userProfile.getOrganization().getId());

        List<InvitationStatus> statusList = Arrays.asList(InvitationStatus.ACCEPTED, InvitationStatus.SENT);
        Set<Long> filteredPatientIds = invitationRepository.findPatientIdsByPatientIdsAndStatus(
                patientIds, UserType.DOCTOR, UserType.PATIENT, statusList);

        Set<Long> patientsWithAlignerJourneys =
                alignerJourneyRepository.findPatientIdsWithAlignerJourneys(filteredPatientIds);

        long clearAlignerActiveCount = patientsWithAlignerJourneys.size();

        Collection<BracesTreatmentStage> stages =
                Arrays.asList(BracesTreatmentStage.ACTIVE, BracesTreatmentStage.DISCARDED);
        List<BracesJourneySummary> bracesJourneySummaries =
                bracesJourneyRepository.findBracesJourneySummariesByCriteria(filteredPatientIds, stages);

        long bracesActiveCount = bracesJourneySummaries.stream()
                .filter(summary -> summary.getAppointmentCount() > 0)
                .count();

        long totalActive = clearAlignerActiveCount + bracesActiveCount;

        return PatientCount.builder()
                .newActivePatient(totalActive)
                .totalNewPatient(filteredPatientIds.size())
                .build();
    }

    @Override
    public UpcomingAlignerChangesDetails upcomingAlignerChange(long doctorId, Long organizationId) {

        List<PatientDoctorOrganization> patientDoctorOrganizations =
                patientDoctorOrganizationRepository.findByDoctorIdAndOrganizationId(doctorId, organizationId);

        Set<Long> mappedPatientIds = patientDoctorOrganizations.stream()
                .map(pdo -> pdo.getPatient().getId())
                .collect(Collectors.toSet());

        var changes = alignerJourneyRepository
                .findByPatientIdInAndProgressStatus(mappedPatientIds.stream().toList(), ProgressStatus.IN_PROGRESS)
                .parallelStream()
                .map(alignerJourney -> {
                    var patient = alignerJourney.getPatient();
                    if (mappedPatientIds.contains(patient.getId())) {
                        var currentAligner = alignerJourney.getCurrentAligner();
                        if (currentAligner == null) {
                            throw new BadRequestException("current aligner is not set");
                        }
                        assert currentAligner.getChangeDate() != null;
                        var changeBuilder = UpcomingAlignerChangesDetails.UpcomingAlignerChange.builder()
                                .alignerJourneyId(alignerJourney.getId())
                                .patientId(patient.getId())
                                .currentAlignerNo(currentAligner.getSrNo())
                                .currentAlignerCompliance(currentAligner.complianceBasedOnCurrentAligner())
                                .currentAlignerJawType(currentAligner.getJawType())
                                .changeDate(currentAligner.getChangeDate())
                                .recommendedHoursToWearAligners(alignerJourney.getRecommendedHoursToWearAligners())
                                .patientName(patient.fullName())
                                .countryCode(patient.getCountryCode())
                                .patientProfile(patient.getProfilePictureUrl())
                                .alignerChangeStatus(getAlignerChangeStatus(currentAligner.getEndDate()))
                                .currentAlignerEndDate(currentAligner.getEndDate())
                                .changeOffset(getChangeOffset(currentAligner.getEndDate()))
                                .isPatientConnected(Boolean.TRUE.equals(
                                        alignerJourney.getTracking().getIsPatientConnected()))
                                .trackingType(alignerJourney.getTracking().getTrackingType())
                                .currentAlignerAvgWearTimeInSecs(
                                        currentAligner.avgWearTimeInSecsBasedOnCurrentAligner())
                                .mobileNo(patient.getMobileNo());

                        int nextAlignerNo = currentAligner.getSrNo() + 1;
                        try {
                            var nextAligner = alignerJourney.getAligner(nextAlignerNo);
                            if (nextAligner != null) {
                                changeBuilder.nextAlignerNo(nextAligner.getSrNo());
                                changeBuilder.nextAlignerJawType(nextAligner.getJawType());
                                return changeBuilder.build();
                            }
                        } catch (AlignerNotFoundException ignored) {
                        }
                    }

                    return null;
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(UpcomingAlignerChangesDetails.UpcomingAlignerChange::getChangeOffset))
                .toList();

        return new UpcomingAlignerChangesDetails(changes);
    }

    private AlignerChangeStatus getAlignerChangeStatus(LocalDate changeDate) {
        if (changeDate == null) {
            return null;
        }

        LocalDate today = LocalDate.now();

        if (changeDate.isBefore(today)) {
            return AlignerChangeStatus.DELAYED;
        } else if (changeDate.isAfter(today)) {
            return AlignerChangeStatus.EARLY;
        } else {
            return AlignerChangeStatus.ON_TIME;
        }
    }

    private Integer getChangeOffset(LocalDate endDate) {
        if (endDate == null) {
            return null;
        }
        LocalDate today = LocalDate.now();
        long daysDifference = ChronoUnit.DAYS.between(today, endDate);

        return (int)
                switch ((int) Math.signum(daysDifference)) {
                    case -1 -> -Math.abs(daysDifference);
                    case 0 -> 0;
                    case 1 -> Math.abs(daysDifference);
                    default -> throw new IllegalStateException("Unexpected value: " + daysDifference);
                };
    }

    @Override
    public PendingPatientActionCategorizedResponse pendingPatientActionResponse(PendingPatientActionRequest request) {

        List<PatientDoctorOrganization> patientDoctorOrganizations =
                patientDoctorOrganizationRepository.findByDoctorIdAndOrganizationId(
                        request.getDoctorId(), request.getOrganizationId());

        Set<Long> mappedPatientIds = patientDoctorOrganizations.stream()
                .map(pdo -> pdo.getPatient().getId())
                .collect(Collectors.toSet());

        List<InvitationStatus> statusList = List.of(InvitationStatus.ACCEPTED, InvitationStatus.SENT);
        List<Invitation> invitations =
                invitationRepository.findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusIn(
                        request.getDoctorId(), UserType.DOCTOR, UserType.PATIENT, statusList);

        List<Patient> patients = invitations.stream()
                .map(Invitation::getPatientInvitation)
                .filter(Objects::nonNull)
                .map(PatientInvitationDetails::getPatient)
                .toList();

        List<Long> patientIds = patients.stream().map(Patient::getId).collect(Collectors.toList());
        List<Status> statuses = Arrays.asList(Status.ACTIVE, Status.PAUSED);

        Set<Long> patientsWithActiveTracking =
                new HashSet<>(trackingRepository.findPatientIdsWithActiveTrackingByStatuses(statuses, patientIds));
        Set<Long> patientsActiveWithTreatmentPlans =
                new HashSet<>(treatmentPlanRepository.findPatientIdsWithTreatmentPlansByStatus(
                        request.getDoctorId(), patientIds, AlignerTreatmentStatus.ACTIVE));
        Set<Long> patientsWithManualTracking =
                new HashSet<>(trackingRepository.findPatientIdsWithTrackingType(TrackingType.MANUAL, patientIds));

        PendingPatientActionCategorizedResponse response = new PendingPatientActionCategorizedResponse();

        for (Patient patient : patients) {
            if (!mappedPatientIds.contains(patient.getId())) continue;
            for (PendingActionEnum action : PendingActionEnum.values()) {
                if (isPendingAction(
                        action,
                        patient,
                        patientsWithActiveTracking,
                        patientsActiveWithTreatmentPlans,
                        patientsWithManualTracking,
                        invitations)) {
                    PendingPatientActionResponse patientResponse = PendingPatientActionResponse.from(patient);
                    response.getCategorizedPatients().get(action).add(patientResponse);
                }
            }
        }
        response.updateActionCounts();
        return response;
    }

    private boolean isPendingAction(
            PendingActionEnum action,
            Patient patient,
            Set<Long> patientsWithActiveTracking,
            Set<Long> patientsWithTreatmentPlans,
            Set<Long> patientsWithManualTracking,
            List<Invitation> invitations) {
        return switch (action) {
            case ADD_TREATMENT -> needsTreatment(patient);
            case SET_UP_TREATMENT_PLAN -> needsTreatmentPlan(patient, patientsWithTreatmentPlans);
            case ADD_TRACKING -> needsTracking(patient, patientsWithActiveTracking, patientsWithTreatmentPlans);
            case CONNECT_WITH_PATIENT -> needsConnection(
                    patient,
                    patientsWithActiveTracking,
                    patientsWithTreatmentPlans,
                    patientsWithManualTracking,
                    invitations);
        };
    }

    @Override
    public Map<PendingActionEnum, Integer> getPendingActionCounts(Long doctorId) {
        Map<PendingActionEnum, Integer> actionCounts = new EnumMap<>(PendingActionEnum.class);
        for (PendingActionEnum action : PendingActionEnum.values()) {
            actionCounts.put(action, 0);
        }

        List<InvitationStatus> statusList = List.of(InvitationStatus.ACCEPTED, InvitationStatus.SENT);
        List<Invitation> invitations =
                invitationRepository.findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusIn(
                        doctorId, UserType.DOCTOR, UserType.PATIENT, statusList);

        if (invitations.isEmpty()) {
            return actionCounts;
        }

        List<Long> patientIds = invitations.stream()
                .map(Invitation::getPatientInvitation)
                .filter(Objects::nonNull)
                .map(PatientInvitationDetails::getPatient)
                .filter(Objects::nonNull)
                .map(Patient::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (patientIds.isEmpty()) {
            return actionCounts;
        }

        List<Status> statuses = Arrays.asList(Status.ACTIVE, Status.PAUSED);
        Set<Long> patientsWithActiveTracking =
                new HashSet<>(trackingRepository.findPatientIdsWithActiveTrackingByStatuses(statuses, patientIds));
        Set<Long> patientsActiveWithTreatmentPlans =
                new HashSet<>(treatmentPlanRepository.findPatientIdsWithTreatmentPlansByStatus(
                        doctorId, patientIds, AlignerTreatmentStatus.ACTIVE));
        Set<Long> patientsWithManualTracking =
                new HashSet<>(trackingRepository.findPatientIdsWithTrackingType(TrackingType.MANUAL, patientIds));

        for (Invitation invitation : invitations) {
            PatientInvitationDetails patientInvitation = invitation.getPatientInvitation();
            if (patientInvitation == null) {
                continue;
            }

            Patient patient = patientInvitation.getPatient();
            if (patient == null) {
                continue;
            }

            for (PendingActionEnum action : PendingActionEnum.values()) {
                if (isPendingAction(
                        action,
                        patient,
                        patientsWithActiveTracking,
                        patientsActiveWithTreatmentPlans,
                        patientsWithManualTracking,
                        invitations)) {
                    actionCounts.put(action, actionCounts.get(action) + 1);
                }
            }
        }

        return actionCounts;
    }

    private boolean needsTreatment(Patient patient) {
        List<ProductTypeName> productTypeNames = patient.getProductTypeNames();
        return productTypeNames.size() == 1 && productTypeNames.contains(ProductTypeName.UNASSIGNED);
    }

    private boolean needsTreatmentPlan(Patient patient, Set<Long> patientsWithTreatmentPlans) {
        List<ProductTypeName> productTypeNames = patient.getProductTypeNames();

        boolean hasOnlyUnassignedAndBraces = productTypeNames.size() == 2
                && productTypeNames.contains(ProductTypeName.UNASSIGNED)
                && productTypeNames.contains(ProductTypeName.BRACES);

        boolean hasTreatment = productTypeNames.stream().anyMatch(type -> type != ProductTypeName.UNASSIGNED);

        return hasTreatment && !hasOnlyUnassignedAndBraces && !patientsWithTreatmentPlans.contains(patient.getId());
    }

    private boolean needsTracking(
            Patient patient, Set<Long> patientsWithActiveTracking, Set<Long> patientsWithTreatmentPlans) {
        List<ProductTypeName> productTypeNames = patient.getProductTypeNames();
        boolean hasTreatment = !(productTypeNames.size() == 1 && productTypeNames.contains(ProductTypeName.UNASSIGNED));
        return hasTreatment
                && patientsWithTreatmentPlans.contains(patient.getId())
                && !patientsWithActiveTracking.contains(patient.getId());
    }

    private boolean needsConnection(
            Patient patient,
            Set<Long> patientsWithActiveTracking,
            Set<Long> patientsWithTreatmentPlans,
            Set<Long> patientsWithManualTracking,
            List<Invitation> invitations) {
        boolean hasTracking = patientsWithActiveTracking.contains(patient.getId());
        boolean hasTreatment = !(patient.getProductTypeNames().size() == 1
                && patient.getProductTypeNames().contains(ProductTypeName.UNASSIGNED));
        boolean hasTreatmentPlan = patientsWithTreatmentPlans.contains(patient.getId());
        boolean hasManualTracking = patientsWithManualTracking.contains(patient.getId());

        return hasTreatment
                && hasTracking
                && hasTreatmentPlan
                && !hasManualTracking
                && invitations.stream()
                        .filter(invitation -> invitation.getPatientInvitation() != null
                                && invitation.getPatientInvitation().getPatient() != null
                                && invitation
                                                .getPatientInvitation()
                                                .getPatient()
                                                .getId()
                                        != null
                                && invitation
                                        .getPatientInvitation()
                                        .getPatient()
                                        .getId()
                                        .equals(patient.getId()))
                        .anyMatch(invitation -> invitation.getStatus() == InvitationStatus.SENT);
    }

    @Override
    public List<DoctorPatientDetails> filterPatients(FilterPatientRequest filterPatientRequest) {
        List<Compliance> compliance = filterPatientRequest.getComplianceList();
        List<String> brands = filterPatientRequest.getBrandFilters();

        List<Long> patientIds = null;
        List<Patient> patients = null;
        if (filterPatientRequest.getPatientStatus().equals(PatientStatus.ACTIVE)) {
            patients = patientRepository.findByDoctorIdAndPatientStatus(
                    filterPatientRequest.getDoctorId(), PatientStatus.ACTIVE);

            patientIds = patients.stream().map(Patient::getId).toList();
        }
        if (filterPatientRequest.getPatientStatus().equals(PatientStatus.ALL)) {
            patients = patientRepository.findByDoctorId(filterPatientRequest.getDoctorId());

            patientIds = patients.stream().map(Patient::getId).toList();
        }
        if (filterPatientRequest.getPatientStatus().equals(PatientStatus.INACTIVE)) {
            patients = patientRepository.findByDoctorIdAndPatientStatus(
                    filterPatientRequest.getDoctorId(), PatientStatus.INACTIVE);

            patientIds = patients.stream().map(Patient::getId).toList();
        }
        if (filterPatientRequest.getPatientStatus().equals(PatientStatus.COMPLETED)) {
            patients = patientRepository.findByDoctorIdAndPatientStatus(
                    filterPatientRequest.getDoctorId(), PatientStatus.COMPLETED);

            patientIds = patients.stream().map(Patient::getId).toList();
        }

        List<Long> filteredPatientIds = patientIds;

        if (brands != null && !brands.isEmpty()) {
            List<AlignerJourney> alignerJourneys = alignerJourneyRepository.findByPatientIdIn(patientIds);
            alignerJourneys = alignerJourneys.stream()
                    .filter(journey -> !journey.getProgressStatus().equals(ProgressStatus.NOT_STARTED))
                    .filter(journey -> brands.contains(journey.getBrand()))
                    .collect(Collectors.toList());

            filteredPatientIds = alignerJourneys.stream()
                    .map(journey -> journey.getPatient().getId())
                    .collect(Collectors.toList());
        }

        List<AlignerJourney> alignerJourneys = alignerJourneyRepository.findByPatientIdIn(filteredPatientIds);

        List<Long> finalFilteredPatientIds = filteredPatientIds;

        return patients.stream()
                .filter(patient -> finalFilteredPatientIds.contains(patient.getId()))
                .map(patient -> {
                    Optional<AlignerJourney> alignerJourney;
                    DoctorPatientDetails details = new DoctorPatientDetails();
                    if (compliance != null && !compliance.isEmpty()) {
                        alignerJourney = alignerJourneys.stream()
                                .filter(journey -> !journey.getProgressStatus().equals(ProgressStatus.NOT_STARTED))
                                .filter(journey -> journey.getPatient().getId().equals(patient.getId()))
                                .findFirst();

                        if (alignerJourney.isPresent()) {
                            if (alignerJourney.get().getStartAlignerNo() != null) {
                                var currentAligner = alignerJourney.get().getCurrentAligner();
                                Compliance currentAlignerCompliance = null;
                                if (currentAligner != null) {
                                    currentAlignerCompliance = currentAligner.compliance();
                                }
                                if (compliance.contains(currentAlignerCompliance)) {
                                    details.setPatientName(patient.fullName());
                                    details.setMobile(patient.getMobileNo());
                                    details.setPatientProfile(patient.getProfilePictureUrl());
                                    details.setPatientId(patient.getId());
                                    details.setPracticeLocationName(patient.getPracticeLocationName());
                                    details.setPatientProfile(patient.getProfilePictureUrl());
                                    details.setAvgWearTimeInSecs(
                                            alignerJourney.get().avgWearTimeInSecs());
                                    details.setProgressStatus(
                                            alignerJourney.get().getProgressStatus());
                                    details.setBrandName(alignerJourney.get().getBrand());

                                    details.setTreatmentStartDate(
                                            alignerJourney.get().getDoctorTreatmentStartDate());
                                    Aligner aligner = alignerJourney.get().getCurrentAligner();
                                    Integer daysRemainingOnCurrentAligner =
                                            alignerJourney.get().daysRemainingOnCurrentAligner();
                                    details.setDaysRemaining(daysRemainingOnCurrentAligner);

                                    if (aligner != null) {
                                        details.setCurrentAligner(aligner.getJawType()
                                                + " "
                                                + aligner.getSrNo()
                                                + " of "
                                                + alignerJourney.get().totalAligners());
                                        details.setCurrentAlignerCompliance(
                                                alignerJourney.get().getTracking() != null
                                                                && alignerJourney
                                                                        .get()
                                                                        .getTracking()
                                                                        .getTrackingType()
                                                                        .equals(TrackingType.MANUAL)
                                                        ? null
                                                        : Objects.requireNonNull(alignerJourney
                                                                        .get()
                                                                        .getCurrentAligner())
                                                                .compliance());
                                    }
                                }
                            }
                        }
                    } else {

                        alignerJourney = alignerJourneys.stream()
                                .filter(journey -> !journey.getProgressStatus().equals(ProgressStatus.NOT_STARTED))
                                .filter(journey -> journey.getPatient().getId().equals(patient.getId()))
                                .findFirst();

                        if (alignerJourney.isPresent()) {
                            if (alignerJourney.get().getStartAlignerNo() != null) {
                                details.setPatientName(patient.fullName());
                                details.setMobile(patient.getMobileNo());
                                details.setPatientProfile(patient.getProfilePictureUrl());
                                details.setPatientId(patient.getId());
                                details.setPracticeLocationName(patient.getPracticeLocationName());
                                details.setPatientProfile(patient.getProfilePictureUrl());
                                details.setBrandName(alignerJourney.get().getBrand());
                                details.setProgressStatus(alignerJourney.get().getProgressStatus());

                                details.setTreatmentStartDate(
                                        alignerJourney.get().getDoctorTreatmentStartDate());

                                details.setCurrentAlignerCompliance(
                                        alignerJourney.get().getTracking() != null
                                                        && alignerJourney
                                                                .get()
                                                                .getTracking()
                                                                .getTrackingType()
                                                                .equals(TrackingType.MANUAL)
                                                ? null
                                                : alignerJourney
                                                        .get()
                                                        .getCurrentAligner()
                                                        .compliance());
                                Integer daysRemainingOnCurrentAligner =
                                        alignerJourney.get().daysRemainingOnCurrentAligner();

                                Aligner aligner = alignerJourney.get().getCurrentAligner();

                                if (aligner != null) {
                                    details.setCurrentAligner(aligner.getJawType()
                                            + " "
                                            + aligner.getSrNo()
                                            + " of "
                                            + alignerJourney.get().totalAligners());
                                    details.setCurrentAlignerCompliance(
                                            alignerJourney.get().getTracking() != null
                                                            && alignerJourney
                                                                    .get()
                                                                    .getTracking()
                                                                    .getTrackingType()
                                                                    .equals(TrackingType.MANUAL)
                                                    ? null
                                                    : alignerJourney
                                                            .get()
                                                            .getCurrentAligner()
                                                            .compliance());
                                }
                                details.setDaysRemaining(daysRemainingOnCurrentAligner);
                                details.setAvgWearTimeInSecs(
                                        alignerJourney.get().avgWearTimeInSecs());
                            }
                        }
                    }
                    return details;
                })
                .filter(details -> details.getPatientId() != null)
                .collect(Collectors.toList());
    }

    @Override
    public Long getAlignerJourneyIdOfPatient(Long id) {
        List<AlignerJourney> alignerJourneyList = alignerJourneyRepository.findByPatientId(id);
        AlignerJourney lastAddedAlignerJourney = null;
        if (!alignerJourneyList.isEmpty()) {
            lastAddedAlignerJourney =
                    Collections.max(alignerJourneyList, Comparator.comparing(AlignerJourney::getCreatedAt));
            return lastAddedAlignerJourney.getId();
        }
        return null;
    }

    @Override
    public List<NotSetUpTreatmentPatient> withoutTreatmentPatient(Long doctorId) {

        List<Patient> patients = patientRepository.findByDoctorId(doctorId);
        List<NotSetUpTreatmentPatient> notSetUpTreatmentPatients = new ArrayList<>();

        for (Patient patient : patients) {
            List<AlignerJourney> alignerJourneyList = alignerJourneyRepository.findByPatientId(patient.getId());
            if (alignerJourneyList.isEmpty()) {
                var patientInvitationDetails = patientInvitationDetailsRepository.findByPatientId(patient.getId());
                Invitation invitation = null;
                if (patientInvitationDetails.isPresent()) {
                    invitation = patientInvitationDetails.get().getInvitation();
                }
                NotSetUpTreatmentPatient notSetUpTreatmentPatient = getNotSetUpTreatmentPatient(patient, invitation);

                notSetUpTreatmentPatients.add(notSetUpTreatmentPatient);
            }
        }

        return notSetUpTreatmentPatients;
    }

    private static NotSetUpTreatmentPatient getNotSetUpTreatmentPatient(Patient patient, Invitation invitation) {
        NotSetUpTreatmentPatient response = new NotSetUpTreatmentPatient();

        response.setFirstName(patient.getFirstName());
        response.setLastName(patient.getLastName());

        response.setStatusList("AWAITING_TREATMENT_PLAN");
        response.setPatientId(patient.getId());
        response.setMobile(patient.getMobileNo());
        response.setEmail(patient.getEmail());
        response.setCountryCode(patient.getCountryCode());

        if (invitation != null) {
            response.setRequestDate(invitation.getCreatedAt());
            var sentCount = invitation.getSentCount();
            var inviteDate = invitation.getResentInviteAt();

            assert invitation.getPatientInvitation() != null;
            response.setPracticeLocation(invitation.getPatientInvitation().getPracticeLocation());
            response.setInvitationId(invitation.getId());
            response.setInviteCode(invitation.getInvitationCode().getCode());
            response.setInviteSent(
                    inviteDate != null && inviteDate.toLocalDate().isEqual(LocalDate.now()) && sentCount == 1);
        }
        return response;
    }
}
