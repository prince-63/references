package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.aligner.projection.AlignerAnalyticsCounts;
import com.dentalstack.patient.feature.aligner.projection.PatientDueStatusCounts;
import com.dentalstack.patient.feature.dashboardlabel.entity.DashboardLabels;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountDetails;
import com.dentalstack.patient.feature.invitation.projection.InvitationCountsProjection;
import com.dentalstack.patient.feature.order.dto.OrdersCountResponse;
import com.dentalstack.patient.feature.order.projection.ManufacturingBatchCountsProjection;
import com.dentalstack.patient.feature.order.util.CustomerActionPendingMapper;
import com.dentalstack.patient.feature.patient.dto.PatientCountDTO;
import com.dentalstack.patient.feature.patient.dto.PatientCountResponse;
import java.io.Serial;
import java.io.Serializable;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorDashboardResponseV3 implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private DashboardDetails dashboardDetails;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DashboardDetails implements Serializable {
        private StarterPlan starterPlan;
        private ProfessionalPlan professionalPlan;
        private PracticeConnectedToOrg practiceConnectedToOrg;
        private EnterpriseProfessionalPlan enterpriseProfessionalPlan;
        private GrowthPlan growthPlan;
        private DesignLab designLab;
        private ThirdPartyCustomer thirdPartyCustomer;
        private ThirdPartyLab thirdPartyLab;
        private LabelName labelName;
        private EnterpriseLabStaff enterpriseLabStaff;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class LabelName implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String home;
        private String workspace;
        private String customerView;
        private String labView;

        public static LabelName from() {
            return LabelName.builder()
                    .home("Home")
                    .workspace("WorkSpace")
                    .customerView("Customer view")
                    .build();
        }

        public static LabelName enterprisePlanName() {
            return LabelName.builder()
                    .home("Home")
                    .workspace("Practice orders")
                    .customerView("Customer orders")
                    .labView("Lab orders")
                    .build();
        }

        public static LabelName from(DashboardLabels labels) {
            return LabelName.builder()
                    .home(labels.getHome())
                    .workspace(labels.getWorkspace())
                    .customerView(labels.getCustomerView())
                    .labView(labels.getLabView())
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EnterpriseLabStaff implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private EnterpriseLabPracticeOrder practiceOrder;
        private EnterpriseLabCustomerOrders customerOrders;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EnterpriseLabPracticeOrder implements Serializable {

        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer approved;
        private Integer inRePlan;
        private Integer completed;
        private EnterpriseLabStaffMyTask myTask;
        private NeedAttention needAttention;
        private EnterpriseLabStaffCustomerActionPending customerActionPending;

        public static EnterpriseLabPracticeOrder practiceOrder(OrdersCountResponse practiceOrder) {
            var practiceOrderCount = practiceOrder.getCount();
            if (practiceOrderCount == null) {
                return EnterpriseLabPracticeOrder.builder()
                        .ordered(0)
                        .inProgress(0)
                        .inReview(0)
                        .approved(0)
                        .inRePlan(0)
                        .completed(0)
                        .build();
            }

            int ordered = safeIntConvert(practiceOrderCount.getOrdered());
            int inProgress = safeIntConvert(practiceOrderCount.getInProgress());
            int inReview = safeIntConvert(practiceOrderCount.getInReview());
            int approved = safeIntConvert(practiceOrderCount.getApproved());
            int inRePlan = safeIntConvert(practiceOrderCount.getReplan());
            int completed = safeIntConvert(practiceOrderCount.getCompleted());

            return EnterpriseLabPracticeOrder.builder()
                    .ordered(ordered)
                    .inProgress(inProgress)
                    .inReview(inReview)
                    .approved(approved)
                    .inRePlan(inRePlan)
                    .completed(completed)
                    .myTask(EnterpriseLabStaffMyTask.from(practiceOrder.getTask()))
                    .needAttention(NeedAttention.from(practiceOrder))
                    .customerActionPending(EnterpriseLabStaffCustomerActionPending.from(practiceOrder))
                    .build();
        }

        private static int safeIntConvert(Long value) {
            return value != null ? Math.toIntExact(value) : 0;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EnterpriseLabStaffMyTask implements Serializable {

        private Long inProgress;
        private Long reviewAssignedOrdersToMe;

        public static EnterpriseLabStaffMyTask from(OrdersCountResponse.TaskDetails task) {
            if (task == null) {
                return new EnterpriseLabStaffMyTask();
            }

            return EnterpriseLabStaffMyTask.builder()
                    .inProgress(task.getInProgress() != null ? task.getInProgress() : 0L)
                    .reviewAssignedOrdersToMe(
                            task.getReviewAssignedOrdersToMe() != null ? task.getReviewAssignedOrdersToMe() : 0L)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnterpriseLabStaffCustomerActionPending {
        private Long inReview;
        private Long approved;
        private Long stlFilesUploaded;

        public static EnterpriseLabStaffCustomerActionPending from(OrdersCountResponse response) {
            if (response == null || response.getGettingStarted() == null) {
                return new EnterpriseLabStaffCustomerActionPending();
            }

            OrdersCountResponse.Count count = response.getCount();

            return EnterpriseLabStaffCustomerActionPending.builder()
                    .inReview(count != null && count.getInReview() != null ? count.getInReview() : 0L)
                    .approved(count != null && count.getApproved() != null ? count.getApproved() : 0L)
                    .stlFilesUploaded(
                            count != null && count.getStlFileApproved() != null ? count.getStlFileApproved() : 0L)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EnterpriseLabCustomerOrders implements Serializable {
        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer inRePlan;
        private Integer approved;
        private Integer stlFilesRequested;
        private Integer stlFilesUploaded;
        private Integer completed;
        private EnterpriseLabStaffMyTask myTask;
        private EnterpriseLabStaffCustomerActionPending customerActionPending;
        private NeedAttention needAttention;

        public static EnterpriseLabCustomerOrders customerOrders(OrdersCountResponse customerOrders) {
            var customerOrdersCount = customerOrders.getCount();
            if (customerOrdersCount == null) {
                return EnterpriseLabCustomerOrders.builder()
                        .ordered(0)
                        .inProgress(0)
                        .inReview(0)
                        .approved(0)
                        .stlFilesRequested(0)
                        .inRePlan(0)
                        .completed(0)
                        .stlFilesUploaded(0)
                        .build();
            }

            int ordered = safeIntConvert(customerOrdersCount.getOrdered());
            int inProgress = safeIntConvert(customerOrdersCount.getInProgress());
            int inReview = safeIntConvert(customerOrdersCount.getInReview());
            int approved = safeIntConvert(customerOrdersCount.getApproved());
            int stlFilesRequested = safeIntConvert(customerOrdersCount.getStlFileRequested());
            int inRePlan = safeIntConvert(customerOrdersCount.getReplan());
            int completed = safeIntConvert(customerOrdersCount.getCompleted());

            int stlFileUploaded = safeIntConvert(customerOrdersCount.getStlFileApproved());

            return EnterpriseLabCustomerOrders.builder()
                    .ordered(ordered)
                    .inProgress(inProgress)
                    .inReview(inReview)
                    .approved(approved)
                    .stlFilesRequested(stlFilesRequested)
                    .inRePlan(inRePlan)
                    .completed(completed)
                    .stlFilesUploaded(stlFileUploaded)
                    .myTask(EnterpriseLabStaffMyTask.from(customerOrders.getTask()))
                    .needAttention(NeedAttention.from(customerOrders))
                    .customerActionPending(EnterpriseLabStaffCustomerActionPending.from(customerOrders))
                    .build();
        }

        private static int safeIntConvert(Long value) {
            return value != null ? Math.toIntExact(value) : 0;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class StarterPlan implements Serializable {
        private PatientsSummary patientsSummary;
        private MyTasks myTasks;
        private PatientCompliance patientCompliance;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ProfessionalPlan implements Serializable {
        private Home home;
        private PracticeOrders workspace;
        private CustomerView customerView;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PracticeConnectedToOrg implements Serializable {
        private PatientsSummaryExtended patientsSummary;
        private MyTasksExtended myTasks;
        private Planning planningStatus;
        private ManufacturingStatus manufacturingStatus;
        private PatientCompliance patientCompliance;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EnterpriseProfessionalPlan implements Serializable {
        private EnterpriseHome home;
        private PracticeOrders practiceOrders;
        private CustomerOrders customerOrders;
        private EnterpriseProfessionalLabOrders labOrders;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EnterpriseProfessionalLabOrders implements Serializable {
        private Orders orders;
        private ProfessionalPlanCustomerViewMyTask myTask;

        public static EnterpriseProfessionalLabOrders from(OrdersCountResponse sentOrders) {
            return EnterpriseProfessionalLabOrders.builder()
                    .orders(Orders.from(sentOrders.getCount()))
                    .myTask(ProfessionalPlanCustomerViewMyTask.from(sentOrders))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PatientsSummary implements Serializable {
        private Integer allPatients;
        private Integer inAssessment;
        private Integer inPlanning;
        private Integer trackingPending;
        private Integer startingSoon;
        private Integer ongoing;
        private Integer completed;
        private Integer paused;
        private Integer inRefinement;

        public static PatientsSummary from(DoctorDashboardCount dashboardCount) {

            int totalPatients = Optional.ofNullable(dashboardCount.getPatientCount())
                    .map(DoctorDashboardCount.PatientCount::getTotal)
                    .orElse(0);
            int activePatients = Optional.ofNullable(dashboardCount.getPatientCount())
                    .map(DoctorDashboardCount.PatientCount::getActive)
                    .orElse(0);
            int leadPatients = Optional.ofNullable(dashboardCount.getPatientCount())
                    .map(DoctorDashboardCount.PatientCount::getLead)
                    .orElse(0);
            int inAssessmentLeads = Optional.ofNullable(dashboardCount.getLeadCount())
                    .map(DoctorDashboardCount.TreatmentCount::getInAssessment)
                    .orElse(0);
            int inPlanningLeads = Optional.ofNullable(dashboardCount.getLeadCount())
                    .map(DoctorDashboardCount.TreatmentCount::getInPlanning)
                    .orElse(0);
            int trackingPendingLeads = Optional.ofNullable(dashboardCount.getLeadCount())
                    .map(DoctorDashboardCount.TreatmentCount::getTrackingPending)
                    .orElse(0);
            int startingSoonTreatments = Optional.ofNullable(dashboardCount.getAllTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getStartingSoon)
                    .orElse(0);
            int ongoingTreatments = Optional.ofNullable(dashboardCount.getAllTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getOngoing)
                    .orElse(0);
            int pausedTreatments = Optional.ofNullable(dashboardCount.getAllTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getPaused)
                    .orElse(0);
            int inRefinementTreatments = Optional.ofNullable(dashboardCount.getAllTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getRefinement)
                    .orElse(0);

            int completed = Optional.ofNullable(dashboardCount.getAllTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getCompleted)
                    .orElse(0);

            return PatientsSummary.builder()
                    .allPatients(totalPatients)
                    .inAssessment(inAssessmentLeads)
                    .inPlanning(inPlanningLeads)
                    .trackingPending(trackingPendingLeads)
                    .startingSoon(startingSoonTreatments)
                    .ongoing(ongoingTreatments)
                    .paused(pausedTreatments)
                    .inRefinement(inRefinementTreatments)
                    .completed(completed)
                    .build();
        }

        public static PatientsSummary from(PatientCountDTO patientCountDTO) {
            return PatientsSummary.builder()
                    .allPatients(patientCountDTO.getAllPatient())
                    .inAssessment(patientCountDTO.getInAssessment())
                    .inPlanning(patientCountDTO.getInPlanning())
                    .trackingPending(patientCountDTO.getTrackingPending())
                    .startingSoon(patientCountDTO.getStartingSoon())
                    .ongoing(patientCountDTO.getOngoing())
                    .paused(patientCountDTO.getPaused())
                    .inRefinement(patientCountDTO.getInRefinement())
                    .completed(patientCountDTO.getCompleted())
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class MyTasks implements Serializable {
        private Integer totalPending;
        private Integer alignerUpdates;
        private Integer todaysAppointments;
        private Integer completeAssessment;
        private Integer finalizeTreatmentPlan;
        private Integer resumePausedTreatments;
        private Integer createNewRefinementPlan;

        public static MyTasks from(
                Integer alignerUpdates,
                Integer todayAppointments,
                DoctorDashboardCount dashboardCount,
                OrdersCountResponse sentOrdersCount) {

            int completeAssessment = Optional.ofNullable(dashboardCount.getLeadCount())
                    .map(DoctorDashboardCount.TreatmentCount::getInAssessment)
                    .map(Math::toIntExact)
                    .orElse(0);
            int confirmAndSendCases = Optional.ofNullable(sentOrdersCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getDraft)
                    .map(Math::toIntExact)
                    .orElse(0);
            int approveTreatmentPlan = Optional.ofNullable(sentOrdersCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getInReview)
                    .map(Math::toIntExact)
                    .orElse(0);
            int finalizeTreatmentPlan = Optional.ofNullable(dashboardCount.getLeadCount())
                    .map(DoctorDashboardCount.TreatmentCount::getInPlanning)
                    .map(Math::toIntExact)
                    .orElse(0);
            int resumePausedTreatments = Optional.ofNullable(dashboardCount.getAlignerTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getPaused)
                    .map(Math::toIntExact)
                    .orElse(0);
            int createNewRefinementPlan = Optional.ofNullable(dashboardCount.getAlignerTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getRefinement)
                    .map(Math::toIntExact)
                    .orElse(0);

            int totalPending = alignerUpdates
                    + completeAssessment
                    + confirmAndSendCases
                    + finalizeTreatmentPlan
                    + resumePausedTreatments
                    + createNewRefinementPlan
                    + todayAppointments
                    + approveTreatmentPlan;
            return MyTasks.builder()
                    .totalPending(totalPending)
                    .alignerUpdates(alignerUpdates)
                    .todaysAppointments(todayAppointments)
                    .completeAssessment(completeAssessment)
                    .finalizeTreatmentPlan(finalizeTreatmentPlan)
                    .resumePausedTreatments(resumePausedTreatments)
                    .createNewRefinementPlan(createNewRefinementPlan)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class MyTasksExtended implements Serializable {
        private Integer totalPending;
        private long alignerUpdates;
        private Integer todayAppointments;
        private Integer completeAssessment;
        private Integer confirmAndSendCase;
        private Integer approveTreatmentPlan;
        private Integer finalizeTreatmentPlan;
        private Integer resumePausedTreatments;
        private Integer createNewRefinementPlan;
        private Integer markOrderAsDelivered;
        private Long assignedExistingCases;
        private Integer needMoreInfo;

        public static MyTasksExtended from(
                Integer alignerUpdates,
                Integer todayAppointments,
                PatientCountResponse patientCountResponse,
                OrdersCountResponse sentOrdersCount,
                ManufacturingBatchCountsProjection manufacturingBatchCountsProjection,
                Long existingPatientFormInProgressCount) {

            int alignerUpdate = alignerUpdates != null ? alignerUpdates : 0;
            int todayAppointmentsCount = todayAppointments != null ? todayAppointments : 0;
            int completeAssessment = patientCountResponse.getInAssessment() != null
                    ? Math.toIntExact(patientCountResponse.getInAssessment())
                    : 0;
            int confirmAndSendCase = Optional.ofNullable(sentOrdersCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getDraft)
                    .map(Math::toIntExact)
                    .orElse(0);
            int approveTreatmentPlan = Optional.ofNullable(sentOrdersCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getInReview)
                    .map(Math::toIntExact)
                    .orElse(0);

            int finalizeTreatmentPlan = Optional.ofNullable(sentOrdersCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getApproved)
                    .map(Math::toIntExact)
                    .orElse(0);

            int needMoreInfo = Optional.ofNullable(sentOrdersCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getNeedMoreInfo)
                    .map(Math::toIntExact)
                    .orElse(0);

            int markOrderAsDelivered = manufacturingBatchCountsProjection.getShippedCount() != null
                    ? manufacturingBatchCountsProjection.getShippedCount()
                    : 0;
            long assignedExistingCases =
                    existingPatientFormInProgressCount != null ? existingPatientFormInProgressCount : 0;
            int resumePausedTreatments =
                    patientCountResponse.getPaused() != null ? patientCountResponse.getPaused() : 0;
            int createNewRefinementPlan =
                    patientCountResponse.getRefinement() != null ? patientCountResponse.getRefinement() : 0;

            var totalPending = alignerUpdate
                    + completeAssessment
                    + confirmAndSendCase
                    + approveTreatmentPlan
                    + finalizeTreatmentPlan
                    + resumePausedTreatments
                    + createNewRefinementPlan
                    + todayAppointmentsCount
                    + markOrderAsDelivered
                    + assignedExistingCases
                    + needMoreInfo;

            return MyTasksExtended.builder()
                    .totalPending((int) totalPending)
                    .alignerUpdates(alignerUpdate)
                    .todayAppointments(todayAppointmentsCount)
                    .completeAssessment(completeAssessment)
                    .confirmAndSendCase(confirmAndSendCase)
                    .approveTreatmentPlan(approveTreatmentPlan)
                    .finalizeTreatmentPlan(finalizeTreatmentPlan)
                    .resumePausedTreatments(resumePausedTreatments)
                    .createNewRefinementPlan(createNewRefinementPlan)
                    .markOrderAsDelivered(markOrderAsDelivered)
                    .assignedExistingCases(assignedExistingCases)
                    .needMoreInfo(needMoreInfo)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PatientCompliance implements Serializable {
        private Integer needsAttention;
        private Integer atRisk;
        private Integer onTrack;

        public static PatientCompliance from(DoctorDashboardCount.PatientCompliance complianceData) {
            int needsAttention = Optional.ofNullable(complianceData)
                    .map(DoctorDashboardCount.PatientCompliance::getNeedsAttention)
                    .orElse(0);
            int atRisk = Optional.ofNullable(complianceData)
                    .map(DoctorDashboardCount.PatientCompliance::getAtRisk)
                    .orElse(0);
            int onTrack = Optional.ofNullable(complianceData)
                    .map(DoctorDashboardCount.PatientCompliance::getOnTrack)
                    .orElse(0);

            return PatientCompliance.builder()
                    .needsAttention(needsAttention)
                    .atRisk(atRisk)
                    .onTrack(onTrack)
                    .build();
        }

        public static PatientCompliance from(AlignerAnalyticsCounts alignerAnalyticsCounts) {

            int needsAttention = Optional.ofNullable(alignerAnalyticsCounts)
                    .map(AlignerAnalyticsCounts::getNeedsAttentionCount)
                    .orElse(0);
            int atRisk = Optional.ofNullable(alignerAnalyticsCounts)
                    .map(AlignerAnalyticsCounts::getAtRiskCount)
                    .orElse(0);
            int onTrack = Optional.ofNullable(alignerAnalyticsCounts)
                    .map(AlignerAnalyticsCounts::getOnTrackCount)
                    .orElse(0);
            return PatientCompliance.builder()
                    .needsAttention(needsAttention)
                    .atRisk(atRisk)
                    .onTrack(onTrack)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Home implements Serializable {
        private Integer patients;
        private Integer practice;
        private Integer labs;
        private OrderSent orderSent;
        private OrdersReceived ordersReceived;
        private ManufacturingStatus manufacturingStatus;
        private Planning planningStatus;
        private PendingTasks pendingTasks;

        public static Home from(
                OrdersCountResponse sentOrder,
                OrdersCountResponse receivedOrder,
                Double sentGrowth,
                Integer totalPatients,
                Integer totalPractice,
                Integer totalLabs,
                Double receivedGrowth,
                ManufacturingBatchCountsProjection manufacturingCounts,
                Long pendingPatientsWithoutBatches,
                PracticeOrders workspace,
                CustomerView customerView) {
            return Home.builder()
                    .patients(totalPatients)
                    .practice(totalPractice)
                    .labs(totalLabs)
                    .orderSent(OrderSent.orderSent(sentOrder.getCount(), sentGrowth))
                    .ordersReceived(OrdersReceived.ordersReceived(receivedOrder.getCount(), receivedGrowth))
                    .manufacturingStatus(ManufacturingStatus.from(manufacturingCounts, pendingPatientsWithoutBatches))
                    .planningStatus(Planning.from(receivedOrder))
                    .pendingTasks(PendingTasks.from(workspace, customerView))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrderSent implements Serializable {
        private Integer total;
        private Integer draft;
        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer approved;
        private Integer stlFilesRequested;
        private Integer stlFilesApproved;
        private Integer inRePlan;
        private Integer completed;
        private Double growthPercentage;
        private Integer cancelled;
        private Integer needMoreInfo;

        public static OrderSent orderSent(OrdersCountResponse.Count sentOrderCount, Double growthPercentage) {
            if (sentOrderCount == null) {
                return OrderSent.builder()
                        .total(0)
                        .draft(0)
                        .ordered(0)
                        .inProgress(0)
                        .inReview(0)
                        .approved(0)
                        .stlFilesRequested(0)
                        .stlFilesApproved(0)
                        .inRePlan(0)
                        .completed(0)
                        .growthPercentage(growthPercentage != null ? growthPercentage : 0.0)
                        .cancelled(0)
                        .needMoreInfo(0)
                        .build();
            }

            int draft = safeIntConvert(sentOrderCount.getDraft());
            int ordered = safeIntConvert(sentOrderCount.getOrdered());
            int inProgress = safeIntConvert(sentOrderCount.getInProgress());
            int inReview = safeIntConvert(sentOrderCount.getInReview());
            int approved = safeIntConvert(sentOrderCount.getApproved());
            int stlFilesRequested = safeIntConvert(sentOrderCount.getStlFileRequested());
            int stlFilesApproved = safeIntConvert(sentOrderCount.getStlFileApproved());
            int inRePlan = safeIntConvert(sentOrderCount.getReplan());
            int completed = safeIntConvert(sentOrderCount.getCompleted());
            int cancelled = safeIntConvert(sentOrderCount.getCancelled());
            int needMoreInfo = safeIntConvert(sentOrderCount.getNeedMoreInfo());

            int total = draft
                    + ordered
                    + inProgress
                    + inReview
                    + approved
                    + stlFilesRequested
                    + stlFilesApproved
                    + inRePlan
                    + completed
                    + cancelled
                    + needMoreInfo;

            return OrderSent.builder()
                    .total(total)
                    .draft(draft)
                    .ordered(ordered)
                    .inProgress(inProgress)
                    .inReview(inReview)
                    .approved(approved)
                    .stlFilesRequested(stlFilesRequested)
                    .stlFilesApproved(stlFilesApproved)
                    .inRePlan(inRePlan)
                    .completed(completed)
                    .growthPercentage(growthPercentage != null ? growthPercentage : 0.0)
                    .cancelled(cancelled)
                    .needMoreInfo(needMoreInfo)
                    .build();
        }

        private static int safeIntConvert(Long value) {
            return value != null ? Math.toIntExact(value) : 0;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrdersReceived implements Serializable {
        private Integer received;
        private Double growthPercentage;

        public static OrdersReceived ordersReceived(
                OrdersCountResponse.Count orderRecievedCount, Double growthPercentage) {
            int total = Optional.ofNullable(orderRecievedCount)
                    .map(OrdersCountResponse.Count::getTotal)
                    .map(Math::toIntExact)
                    .orElse(0);

            return OrdersReceived.builder()
                    .received(total)
                    .growthPercentage(Optional.ofNullable(growthPercentage).orElse(0.0))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ManufacturingStatus implements Serializable {
        private Integer pending;
        private Integer inProgress;
        private Integer inTransit;
        private Integer delivered;
        private Integer completed;
        private Integer total;
        private Long pendingTotal;

        public static ManufacturingStatus from(
                ManufacturingBatchCountsProjection counts, Long pendingPatientsWithoutBatches) {
            if (counts == null) {
                return ManufacturingStatus.builder()
                        .pending(0)
                        .inProgress(0)
                        .inTransit(0)
                        .delivered(0)
                        .completed(0)
                        .total(0)
                        .pendingTotal(0L)
                        .build();
            }

            long pending = pendingPatientsWithoutBatches != null ? pendingPatientsWithoutBatches : 0L;

            int manufacturingStarted =
                    counts.getManufacturingStartedCount() != null ? counts.getManufacturingStartedCount() : 0;
            int completed = counts.getCompletedCount() != null ? counts.getCompletedCount() : 0;

            long totalPending = pending + manufacturingStarted + completed;

            return ManufacturingStatus.builder()
                    .pending((int) pending)
                    .inProgress(manufacturingStarted)
                    .inTransit(counts.getShippedCount() != null ? counts.getShippedCount() : 0)
                    .delivered(counts.getDeliveredCount() != null ? counts.getDeliveredCount() : 0)
                    .completed(completed)
                    .total(counts.getTotalCount() != null ? counts.getTotalCount() : 0)
                    .pendingTotal(totalPending)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PendingTasks implements Serializable {
        private Integer workspace;
        private Integer customerView;

        public static PendingTasks from(PracticeOrders workspace, CustomerView customerView) {

            var pendingTotal = workspace.getManufacturing().getPendingTotal();
            var unprocessedTotal = workspace.getUnprocessed().getTotal();
            var planningTotal = workspace.getPlanning().getTotal();
            var workspaceTotal = pendingTotal + unprocessedTotal + planningTotal;

            return PendingTasks.builder()
                    .workspace((int) workspaceTotal)
                    .customerView(customerView.getMyTask().getTotalPending())
                    .build();
        }

        public static PendingTasks from(Workspace workspace, CustomerView customerView) {
            return PendingTasks.builder()
                    .workspace(workspace.getMyTasks().getTotalPending())
                    .customerView(customerView.getMyTask().getTotalPending())
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Workspace implements Serializable {
        private PatientsSummary patientsSummary;
        private MyTasks myTasks;
        private PatientCompliance patientCompliance;

        public static Workspace from(
                DoctorDashboardCount dashboardCounts,
                Integer alignerUpdates,
                Integer todaysAppointments,
                OrdersCountResponse sentOrdersCount) {
            return Workspace.builder()
                    .patientsSummary(PatientsSummary.from(dashboardCounts))
                    .myTasks(MyTasks.from(alignerUpdates, todaysAppointments, dashboardCounts, sentOrdersCount))
                    .patientCompliance(PatientCompliance.from(dashboardCounts.getPatientCompliance()))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CustomerView implements Serializable {
        private Orders orders;
        private ProfessionalPlanCustomerViewMyTask myTask;

        public static CustomerView from(OrdersCountResponse sentOrders) {
            return CustomerView.builder()
                    .orders(Orders.from(sentOrders.getCount()))
                    .myTask(ProfessionalPlanCustomerViewMyTask.from(sentOrders))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ProfessionalPlanCustomerViewMyTask implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer totalPending;
        private Integer confirmAndSendDraftOrders;
        private Integer approveTreatmentPlan;
        private Integer requestStlFiles;
        private Integer reviewApproveStlFiles;
        private Integer needMoreInfo;

        public static ProfessionalPlanCustomerViewMyTask from(OrdersCountResponse sentOrderCount) {
            int confirmAndSendDraftOrders = Optional.ofNullable(sentOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getDraft)
                    .map(Math::toIntExact)
                    .orElse(0);
            int approveTreatmentPlan = Optional.ofNullable(sentOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getInReview)
                    .map(Math::toIntExact)
                    .orElse(0);
            int requestStlFiles = Optional.ofNullable(sentOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getApproved)
                    .map(Math::toIntExact)
                    .orElse(0);
            int reviewApproveStlFiles = Optional.ofNullable(sentOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getStlFileApproved)
                    .map(Math::toIntExact)
                    .orElse(0);

            int needMoreInfo = Optional.ofNullable(sentOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getNeedMoreInfo)
                    .map(Math::toIntExact)
                    .orElse(0);

            int totalPending = confirmAndSendDraftOrders
                    + approveTreatmentPlan
                    + requestStlFiles
                    + reviewApproveStlFiles
                    + needMoreInfo;

            return ProfessionalPlanCustomerViewMyTask.builder()
                    .confirmAndSendDraftOrders(confirmAndSendDraftOrders)
                    .approveTreatmentPlan(approveTreatmentPlan)
                    .requestStlFiles(requestStlFiles)
                    .reviewApproveStlFiles(reviewApproveStlFiles)
                    .totalPending(totalPending)
                    .needMoreInfo(needMoreInfo)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Orders implements Serializable {
        private Integer draft;
        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer approved;
        private Integer stlFilesRequested;
        private Integer stlFilesApproved;
        private Integer inRePlan;
        private Integer completed;
        private Integer cancelled;
        private Integer needMoreInfo;

        public static Orders from(OrdersCountResponse.Count count) {
            return Orders.builder()
                    .draft(count.getDraft() != null ? Math.toIntExact(count.getDraft()) : 0)
                    .ordered(count.getOrdered() != null ? Math.toIntExact(count.getOrdered()) : 0)
                    .inProgress(count.getInProgress() != null ? Math.toIntExact(count.getInProgress()) : 0)
                    .inReview(count.getInReview() != null ? Math.toIntExact(count.getInReview()) : 0)
                    .approved(count.getApproved() != null ? Math.toIntExact(count.getApproved()) : 0)
                    .stlFilesRequested(
                            count.getStlFileRequested() != null ? Math.toIntExact(count.getStlFileRequested()) : 0)
                    .stlFilesApproved(
                            count.getStlFileApproved() != null ? Math.toIntExact(count.getStlFileApproved()) : 0)
                    .inRePlan(count.getReplan() != null ? Math.toIntExact(count.getReplan()) : 0)
                    .completed(count.getCompleted() != null ? Math.toIntExact(count.getCompleted()) : 0)
                    .cancelled(count.getCancelled() != null ? Math.toIntExact(count.getCancelled()) : 0)
                    .needMoreInfo(count.getNeedMoreInfo() != null ? Math.toIntExact(count.getNeedMoreInfo()) : 0)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ReceivedOrders implements Serializable {
        private Long total;
        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer approved;
        private Integer stlFilesRequested;
        private Integer stlFilesApproved;
        private Integer inRePlan;
        private Integer completed;
        private Double growthPercentage;
        private Integer cancelled;
        private Integer needMoreInfo;

        public static ReceivedOrders from(OrdersCountResponse ordersCountResponse, Double growthPercentage) {

            var count = ordersCountResponse.getCount();
            return ReceivedOrders.builder()
                    .ordered(count.getOrdered() != null ? Math.toIntExact(count.getOrdered()) : 0)
                    .inProgress(count.getInProgress() != null ? Math.toIntExact(count.getInProgress()) : 0)
                    .inReview(count.getInReview() != null ? Math.toIntExact(count.getInReview()) : 0)
                    .approved(count.getApproved() != null ? Math.toIntExact(count.getApproved()) : 0)
                    .stlFilesRequested(
                            count.getStlFileRequested() != null ? Math.toIntExact(count.getStlFileRequested()) : 0)
                    .stlFilesApproved(
                            count.getStlFileApproved() != null ? Math.toIntExact(count.getStlFileApproved()) : 0)
                    .inRePlan(count.getReplan() != null ? Math.toIntExact(count.getReplan()) : 0)
                    .completed(count.getCompleted() != null ? Math.toIntExact(count.getCompleted()) : 0)
                    .growthPercentage(growthPercentage != null ? growthPercentage : 0.0)
                    .total(getTotalOrders(ordersCountResponse))
                    .cancelled(count.getCancelled() != null ? Math.toIntExact(count.getCancelled()) : 0)
                    .needMoreInfo(count.getNeedMoreInfo() != null ? Math.toIntExact(count.getNeedMoreInfo()) : 0)
                    .build();
        }

        private static long getTotalOrders(OrdersCountResponse receivedOrdersCount) {
            if (receivedOrdersCount == null || receivedOrdersCount.getCount() == null) {
                return 0;
            }

            var count = receivedOrdersCount.getCount();

            var inProgress = count.getInProgress() != null ? count.getInProgress() : 0;
            var inReview = count.getInReview() != null ? count.getInReview() : 0;
            var approved = count.getApproved() != null ? count.getApproved() : 0;
            var replan = count.getReplan() != null ? count.getReplan() : 0;
            var completed = count.getCompleted() != null ? count.getCompleted() : 0;
            var ordered = count.getOrdered() != null ? count.getOrdered() : 0;
            var stlFilesRequested = count.getStlFileRequested() != null ? count.getStlFileRequested() : 0;
            var stlFilesApproved = count.getStlFileApproved() != null ? count.getStlFileApproved() : 0;
            var cancelled = count.getCancelled() != null ? count.getCancelled() : 0;
            var needMoreInfo = count.getNeedMoreInfo() != null ? count.getNeedMoreInfo() : 0;

            return ordered
                    + inProgress
                    + inReview
                    + approved
                    + replan
                    + completed
                    + stlFilesRequested
                    + stlFilesApproved
                    + needMoreInfo
                    + cancelled;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EnterpriseHome implements Serializable {
        private PracticeOrdersHome practiceOrders;
        private CustomersOrders customersOrders;
        private LabOrdersHome labOrders;
        private ManufacturingStatus manufacturingStatus;
        private PatientsSummaryExtended patientsTreatmentStage;

        public static EnterpriseHome from(
                OrdersCountResponse practiceOrder,
                OrdersCountResponse CustomerOrder,
                OrdersCountResponse labOrders,
                InvitationCountsProjection invitationCounts,
                ManufacturingBatchCountsProjection manufacturingCounts,
                Long pendingPatientsWithoutBatches,
                PatientCountResponse patientCountResponse,
                Double practiceGrowthPercentage,
                Double customerGrowthPercentage,
                Double labGrowthPercentage) {
            return EnterpriseHome.builder()
                    .practiceOrders(PracticeOrdersHome.from(practiceOrder, practiceGrowthPercentage, invitationCounts))
                    .customersOrders(CustomersOrders.from(
                            CustomerOrder, invitationCounts.getActiveCustomerCount(), customerGrowthPercentage))
                    .labOrders(LabOrdersHome.from(labOrders, labGrowthPercentage, invitationCounts))
                    .manufacturingStatus(ManufacturingStatus.from(manufacturingCounts, pendingPatientsWithoutBatches))
                    .patientsTreatmentStage(PatientsSummaryExtended.from(patientCountResponse))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PracticeOrdersHome implements Serializable {
        private Integer pendingUpdates;
        private Long patients;
        private Integer practices;
        private Double orderGrowthPercentage;
        private Long total;
        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer approved;
        private Integer inRePlan;
        private Integer completed;
        private Integer cancelled;
        private Integer needMoreInfo;

        public static PracticeOrdersHome from(
                OrdersCountResponse receivedOrdersCount,
                Double orderGrowthPercentage,
                InvitationCountsProjection totalPractice) {
            var totalOrders = getTotalOrders(receivedOrdersCount);

            return PracticeOrdersHome.builder()
                    .pendingUpdates(0)
                    .patients(receivedOrdersCount.getCount().getTotalPatientCount())
                    .practices(totalPractice.getActivePracticeCount())
                    .total(totalOrders)
                    .orderGrowthPercentage(orderGrowthPercentage)
                    .ordered(
                            receivedOrdersCount.getCount().getOrdered() != null
                                    ? Math.toIntExact(
                                            receivedOrdersCount.getCount().getOrdered())
                                    : 0)
                    .inProgress(
                            receivedOrdersCount.getCount().getInProgress() != null
                                    ? Math.toIntExact(
                                            receivedOrdersCount.getCount().getInProgress())
                                    : 0)
                    .inReview(
                            receivedOrdersCount.getCount().getInReview() != null
                                    ? Math.toIntExact(
                                            receivedOrdersCount.getCount().getInReview())
                                    : 0)
                    .approved(
                            receivedOrdersCount.getCount().getApproved() != null
                                    ? Math.toIntExact(
                                            receivedOrdersCount.getCount().getApproved())
                                    : 0)
                    .inRePlan(
                            receivedOrdersCount.getCount().getReplan() != null
                                    ? Math.toIntExact(
                                            receivedOrdersCount.getCount().getReplan())
                                    : 0)
                    .completed(
                            receivedOrdersCount.getCount().getCompleted() != null
                                    ? Math.toIntExact(
                                            receivedOrdersCount.getCount().getCompleted())
                                    : 0)
                    .cancelled(
                            receivedOrdersCount.getCount().getCancelled() != null
                                    ? Math.toIntExact(
                                            receivedOrdersCount.getCount().getCancelled())
                                    : 0)
                    .needMoreInfo(
                            receivedOrdersCount.getCount().getNeedMoreInfo() != null
                                    ? Math.toIntExact(
                                            receivedOrdersCount.getCount().getNeedMoreInfo())
                                    : 0)
                    .build();
        }

        private static long getTotalOrders(OrdersCountResponse receivedOrdersCount) {

            if (receivedOrdersCount == null || receivedOrdersCount.getCount() == null) {
                return 0;
            }
            var inProgress = receivedOrdersCount.getCount().getInProgress() != null
                    ? receivedOrdersCount.getCount().getInProgress()
                    : 0L;
            var inReview = receivedOrdersCount.getCount().getInReview() != null
                    ? receivedOrdersCount.getCount().getInReview()
                    : 0L;
            var approved = receivedOrdersCount.getCount().getApproved() != null
                    ? receivedOrdersCount.getCount().getApproved()
                    : 0L;
            var replan = receivedOrdersCount.getCount().getReplan() != null
                    ? receivedOrdersCount.getCount().getReplan()
                    : 0L;
            var completed = receivedOrdersCount.getCount().getCompleted() != null
                    ? receivedOrdersCount.getCount().getCompleted()
                    : 0L;
            var ordered = receivedOrdersCount.getCount().getOrdered() != null
                    ? receivedOrdersCount.getCount().getOrdered()
                    : 0L;

            return ordered + inProgress + inReview + approved + replan + completed;
        }

        public static Home from(
                OrdersCountResponse sentOrder,
                OrdersCountResponse receivedOrder,
                Double sentGrowth,
                Integer totalPatients,
                Integer totalPractice,
                Integer totalLabs,
                Double receivedGrowth,
                ManufacturingBatchCountsProjection manufacturingCounts,
                Long pendingPatientsWithoutBatches,
                PracticeOrders workspace,
                CustomerView customerView) {
            return Home.builder()
                    .patients(totalPatients)
                    .practice(totalPractice)
                    .labs(totalLabs)
                    .orderSent(OrderSent.orderSent(sentOrder.getCount(), sentGrowth))
                    .ordersReceived(OrdersReceived.ordersReceived(receivedOrder.getCount(), receivedGrowth))
                    .manufacturingStatus(ManufacturingStatus.from(manufacturingCounts, pendingPatientsWithoutBatches))
                    .planningStatus(Planning.from(receivedOrder))
                    .pendingTasks(PendingTasks.from(workspace, customerView))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CustomersOrders implements Serializable {
        private Integer pendingUpdates;
        private Long patients;
        private Integer customers;
        private ReceivedOrders orders;

        public static CustomersOrders from(
                OrdersCountResponse receivedOrder, Integer totalCustomers, Double growthPercentage) {
            return CustomersOrders.builder()
                    .pendingUpdates(0)
                    .patients(receivedOrder.getCount().getTotalPatientCount())
                    .customers(totalCustomers)
                    .orders(ReceivedOrders.from(receivedOrder, growthPercentage))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CustomerOrders implements Serializable {
        private ReceivedOrders orders;
        private CustomerOrdersTask myTask;
        private NeedAttention needAttention;
        private CustomerActionPending customerActionPending;
        private Users users;

        public static CustomerOrders from(
                OrdersCountResponse response,
                Double growthPercentage,
                DoctorInvitationCountDetails doctorInvitationCount) {
            if (response == null) {
                return new CustomerOrders();
            }

            return CustomerOrders.builder()
                    .orders(ReceivedOrders.from(response, growthPercentage))
                    .myTask(CustomerOrdersTask.from(response.getTask()))
                    .needAttention(NeedAttention.from(response))
                    .customerActionPending(CustomerActionPending.from(response))
                    .users(Users.from(doctorInvitationCount, response))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CustomerOrdersTask implements Serializable {
        private Long unassignedOrders;
        private Long inProgress;
        private Long reviewAssignedOrdersToMe;

        public static CustomerOrdersTask from(OrdersCountResponse.TaskDetails task) {
            if (task == null) {
                return new CustomerOrdersTask();
            }

            return CustomerOrdersTask.builder()
                    .inProgress(task.getInProgress() != null ? task.getInProgress() : 0L)
                    .reviewAssignedOrdersToMe(
                            task.getReviewAssignedOrdersToMe() != null ? task.getReviewAssignedOrdersToMe() : 0L)
                    .unassignedOrders(task.getUnassignedOrders() != null ? task.getUnassignedOrders() : 0L)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Users implements Serializable {
        private Long active;
        private Long invited;
        private Long userActionPending;
        private Long customerActionPending;

        public static Users from(DoctorInvitationCountDetails userDetails, OrdersCountResponse response) {
            if (userDetails == null) {
                return new Users();
            }

            return Users.builder()
                    .active(userDetails.getActiveLabStaffCount() != null ? userDetails.getActiveLabStaffCount() : 0)
                    .invited(userDetails.getInvitedLabStaffCount() != null ? userDetails.getInvitedLabStaffCount() : 0)
                    .userActionPending(
                            response.getGettingStarted().getUserActionPending() != null
                                    ? response.getGettingStarted().getUserActionPending()
                                    : 0L)
                    .customerActionPending(
                            response.getGettingStarted().getCustomerActionPending() != null
                                    ? response.getGettingStarted().getCustomerActionPending()
                                    : 0L)
                    .build();
        }

        public static Users from(
                DoctorInvitationCountDetails userDetails,
                OrdersCountResponse response,
                OrdersCountResponse assignerOrders) {
            if (userDetails == null) {
                return new Users();
            }

            return Users.builder()
                    .active(userDetails.getActiveLabStaffCount() != null ? userDetails.getActiveLabStaffCount() : 0)
                    .invited(userDetails.getInvitedLabStaffCount() != null ? userDetails.getInvitedLabStaffCount() : 0)
                    .userActionPending(
                            assignerOrders.getGettingStarted().getUserActionPending() != null
                                    ? assignerOrders.getGettingStarted().getUserActionPending()
                                    : 0L)
                    .customerActionPending(
                            assignerOrders.getGettingStarted().getCustomerActionPending() != null
                                    ? assignerOrders.getGettingStarted().getCustomerActionPending()
                                    : 0L)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class LabOrdersHome implements Serializable {
        private Integer pendingUpdates;
        private Long patients;
        private Long labs;
        private Double orderGrowthPercentage;
        private Long total;
        private Integer draft;
        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer approved;
        private Integer stlFilesRequested;
        private Integer stlFilesApproved;
        private Integer inRePlan;
        private Integer completed;
        private Integer cancelled;
        private Integer needMoreInfo;

        public static LabOrdersHome from(
                OrdersCountResponse sentOrdersCount,
                Double orderGrowthPercentage,
                InvitationCountsProjection totalLabs) {
            var totalOrders = getTotalOrders(sentOrdersCount);

            return LabOrdersHome.builder()
                    .pendingUpdates(0)
                    .patients(sentOrdersCount.getCount().getTotalPatientCount())
                    .labs((totalLabs != null && totalLabs.getLabReceivedAcceptedCount() != null
                                    ? totalLabs.getLabReceivedAcceptedCount()
                                    : 0)
                            + (totalLabs != null && totalLabs.getLabSentAcceptedCount() != null
                                    ? totalLabs.getLabSentAcceptedCount()
                                    : 0))
                    .total(totalOrders)
                    .orderGrowthPercentage(orderGrowthPercentage != null ? orderGrowthPercentage : 0)
                    .draft(
                            sentOrdersCount.getCount().getDraft() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getDraft())
                                    : 0)
                    .ordered(
                            sentOrdersCount.getCount().getOrdered() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getOrdered())
                                    : 0)
                    .inProgress(
                            sentOrdersCount.getCount().getInProgress() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getInProgress())
                                    : 0)
                    .inReview(
                            sentOrdersCount.getCount().getInReview() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getInReview())
                                    : 0)
                    .approved(
                            sentOrdersCount.getCount().getApproved() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getApproved())
                                    : 0)
                    .stlFilesRequested(
                            sentOrdersCount.getCount().getStlFileRequested() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getStlFileRequested())
                                    : 0)
                    .stlFilesApproved(
                            sentOrdersCount.getCount().getStlFileApproved() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getStlFileApproved())
                                    : 0)
                    .inRePlan(
                            sentOrdersCount.getCount().getReplan() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getReplan())
                                    : 0)
                    .completed(
                            sentOrdersCount.getCount().getCompleted() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getCompleted())
                                    : 0)
                    .needMoreInfo(
                            sentOrdersCount.getCount().getNeedMoreInfo() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getNeedMoreInfo())
                                    : 0)
                    .cancelled(
                            sentOrdersCount.getCount().getCancelled() != null
                                    ? Math.toIntExact(sentOrdersCount.getCount().getCancelled())
                                    : 0)
                    .build();
        }

        private static long getTotalOrders(OrdersCountResponse sentOrdersCount) {
            if (sentOrdersCount == null || sentOrdersCount.getCount() == null) {
                return 0;
            }

            var count = sentOrdersCount.getCount();

            var inProgress = count.getInProgress() != null ? count.getInProgress() : 0;
            var inReview = count.getInReview() != null ? count.getInReview() : 0;
            var approved = count.getApproved() != null ? count.getApproved() : 0;
            var replan = count.getReplan() != null ? count.getReplan() : 0;
            var completed = count.getCompleted() != null ? count.getCompleted() : 0;
            var ordered = count.getOrdered() != null ? count.getOrdered() : 0;
            var stlFilesRequested = count.getStlFileRequested() != null ? count.getStlFileRequested() : 0;
            var stlFilesApproved = count.getStlFileApproved() != null ? count.getStlFileApproved() : 0;
            var draft = count.getDraft() != null ? count.getDraft() : 0;
            var cancelled = count.getCancelled() != null ? count.getCancelled() : 0;
            var needMoreInfo = count.getNeedMoreInfo() != null ? count.getNeedMoreInfo() : 0;

            return ordered
                    + inProgress
                    + inReview
                    + approved
                    + replan
                    + completed
                    + stlFilesRequested
                    + stlFilesApproved
                    + draft
                    + cancelled
                    + needMoreInfo;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PracticeOrders implements Serializable {
        private PatientsSummaryExtended patientsSummary;
        private Planning planning;
        private ManufacturingStatus manufacturing;
        private Unprocessed unprocessed;
        private PatientCompliance patientCompliance;

        public static PracticeOrders from(
                PatientCountResponse dashboardCount,
                AlignerAnalyticsCounts alignerAnalyticsCounts,
                OrdersCountResponse receivedOrdersCount,
                ManufacturingBatchCountsProjection counts,
                Long pendingPatientsWithoutBatches,
                PatientDueStatusCounts patientDueStatusCounts) {
            return PracticeOrders.builder()
                    .patientsSummary(PatientsSummaryExtended.from(dashboardCount))
                    .planning(Planning.from(receivedOrdersCount))
                    .manufacturing(ManufacturingStatus.from(counts, pendingPatientsWithoutBatches))
                    .unprocessed(Unprocessed.from(patientDueStatusCounts))
                    .patientCompliance(PatientCompliance.from(alignerAnalyticsCounts))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PatientsSummaryExtended implements Serializable {
        private Integer allPatients;
        private Integer inAssessment;
        private Integer inPlanning;
        private Integer inManufacturing;
        private Integer inTransit;
        private Integer startingSoon;
        private Integer ongoing;
        private Integer completed;
        private Integer paused;
        private Integer inRefinement;

        public static PatientsSummaryExtended from(PatientCountResponse dashboardCount) {
            return PatientsSummaryExtended.builder()
                    .allPatients(dashboardCount.getAllPatients())
                    .inAssessment(dashboardCount.getInAssessment())
                    .inPlanning(dashboardCount.getInPlanning())
                    .inManufacturing(dashboardCount.getInManufacturing())
                    .inTransit(dashboardCount.getTransit())
                    .startingSoon(dashboardCount.getStartingSoon())
                    .ongoing(dashboardCount.getOngoing())
                    .completed(dashboardCount.getCompleted())
                    .paused(dashboardCount.getPaused())
                    .inRefinement(dashboardCount.getRefinement())
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Planning implements Serializable {
        private Long pending;
        private Long newCases;
        private Long inProgress;
        private Long inReview;
        private Long rePlan;
        private Long approved;
        private Long total;
        private Long totalPending;
        private Integer cancelled;
        private Integer needMoreInfo;

        public static Planning from(OrdersCountResponse ordersCountResponse) {
            if (ordersCountResponse == null || ordersCountResponse.getCount() == null) {
                return Planning.builder()
                        .pending(0L)
                        .newCases(0L)
                        .inProgress(0L)
                        .inReview(0L)
                        .rePlan(0L)
                        .approved(0L)
                        .total(0L)
                        .totalPending(0L)
                        .cancelled(0)
                        .needMoreInfo(0)
                        .build();
            }

            var counts = ordersCountResponse.getCount();

            Long newCases = counts.getOrdered() != null ? counts.getOrdered() : 0L;
            Long inProgress = counts.getInProgress() != null ? counts.getInProgress() : 0L;
            Long inReview = counts.getInReview() != null ? counts.getInReview() : 0L;
            Long rePlan = counts.getReplan() != null ? counts.getReplan() : 0L;
            Long approved = counts.getApproved() != null ? counts.getApproved() : 0L;
            Integer cancelled = counts.getCancelled() != null ? Math.toIntExact(counts.getCancelled()) : 0;
            Integer needMoreInfo = counts.getNeedMoreInfo() != null ? Math.toIntExact(counts.getNeedMoreInfo()) : 0;

            Integer drafts = counts.getDraft() != null ? Math.toIntExact(counts.getDraft()) : 0;
            Long pending = inProgress + rePlan + newCases;
            Long totalPending = newCases + inProgress + rePlan;
            Long total =
                    newCases + inProgress + inReview + rePlan + approved + pending + drafts + cancelled + needMoreInfo;

            return Planning.builder()
                    .pending(pending)
                    .newCases(newCases)
                    .inProgress(inProgress)
                    .inReview(inReview)
                    .rePlan(rePlan)
                    .approved(approved)
                    .total(total)
                    .totalPending(totalPending)
                    .cancelled(cancelled)
                    .needMoreInfo(needMoreInfo)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Unprocessed implements Serializable {
        private Integer addDueDate;
        private Integer overdue;
        private Integer dueToday;
        private Integer dueThisWeek;
        private Integer dueLater;
        private Integer total;

        public static Unprocessed from(PatientDueStatusCounts patientDueStatusCounts) {

            var total = patientDueStatusCounts.getOverdueCount()
                    + patientDueStatusCounts.getDueTodayCount()
                    + patientDueStatusCounts.getDueThisWeekCount()
                    + patientDueStatusCounts.getDueLaterCount();
            return Unprocessed.builder()
                    .addDueDate(patientDueStatusCounts.getNotAddedCount())
                    .overdue(patientDueStatusCounts.getOverdueCount())
                    .dueToday(patientDueStatusCounts.getDueTodayCount())
                    .dueThisWeek(patientDueStatusCounts.getDueThisWeekCount())
                    .dueLater(patientDueStatusCounts.getDueLaterCount())
                    .total(total)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NeedAttention {
        private Long urgentOrders;
        private Long inRePlan;
        private Long stlFilesRequested;
        private Long addDueDate;
        private Long dueToday;
        private Long overdue;

        public static NeedAttention from(OrdersCountResponse response) {
            if (response == null) {
                return new NeedAttention();
            }

            OrdersCountResponse.NeedsAttentionDetails needsAttention = response.getNeedsAttention();
            OrdersCountResponse.TaskDetails taskDetails = response.getTask();

            return NeedAttention.builder()
                    .urgentOrders(
                            taskDetails != null && taskDetails.getUrgentOrders() != null
                                    ? taskDetails.getUrgentOrders()
                                    : 0L)
                    .inRePlan(
                            needsAttention != null && needsAttention.getInReplan() != null
                                    ? needsAttention.getInReplan()
                                    : 0L)
                    .dueToday(
                            needsAttention != null && needsAttention.getDueToday() != null
                                    ? needsAttention.getDueToday()
                                    : 0L)
                    .overdue(
                            needsAttention != null && needsAttention.getOverdue() != null
                                    ? needsAttention.getOverdue()
                                    : 0L)
                    .stlFilesRequested(
                            needsAttention != null && needsAttention.getStlFileRequested() != null
                                    ? needsAttention.getStlFileRequested()
                                    : 0L)
                    .addDueDate(
                            needsAttention != null && needsAttention.getNotAddedDueBy() != null
                                    ? needsAttention.getNotAddedDueBy()
                                    : 0L)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerActionPending {
        private Long active;
        private Long invited;
        private Long inReview;
        private Long approved;
        private Long stlFilesUploaded;

        public static CustomerActionPending from(OrdersCountResponse response) {
            var mapped = CustomerActionPendingMapper.from(response);
            return CustomerActionPending.builder()
                    .active(mapped.active())
                    .invited(mapped.invited())
                    .inReview(mapped.inReview())
                    .approved(mapped.approved())
                    .stlFilesUploaded(mapped.stlFilesUploaded())
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class GrowthPlan implements Serializable {
        private GrowthHome home;
        private Workspace workspace;
        private CustomerView customerView;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class GrowthHome implements Serializable {
        private Integer patients;
        private OrderSent ordersSent;
        private PendingTasks pendingTasks;

        public static GrowthHome from(
                OrdersCountResponse sentOrder,
                Double sentGrowth,
                Integer totalPatients,
                Workspace workspace,
                CustomerView customerView) {
            return GrowthHome.builder()
                    .patients(totalPatients)
                    .ordersSent(OrderSent.orderSent(sentOrder.getCount(), sentGrowth))
                    .pendingTasks(PendingTasks.from(workspace, customerView))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DesignLab implements Serializable {
        private ReceivedOrders orders;
        private CustomerOrdersTask myTasks;
        private NeedAttention needsAttention;
        private CustomerActionPending customerActionPending;
        private Users users;

        public static DesignLab from(
                OrdersCountResponse response,
                Double growthPercentage,
                DoctorInvitationCountDetails doctorInvitationCount,
                OrdersCountResponse assignedOrders) {
            if (response == null) {
                return new DesignLab();
            }

            return DesignLab.builder()
                    .orders(ReceivedOrders.from(response, growthPercentage))
                    .myTasks(CustomerOrdersTask.from(response.getTask()))
                    .needsAttention(NeedAttention.from(response))
                    .customerActionPending(CustomerActionPending.from(response))
                    .users(Users.from(doctorInvitationCount, response, assignedOrders))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ThirdPartyCustomer implements Serializable {
        private Orders orders;
        private ProfessionalPlanCustomerViewMyTask myTasks;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ThirdPartyLab implements Serializable {
        private ReceivedOrders orders;
        private CustomerOrdersTask myTasks;
        private NeedAttention needsAttention;
        private CustomerActionPending customerActionPending;
        private Users users;

        public static ThirdPartyLab from(
                OrdersCountResponse response,
                Double growthPercentage,
                DoctorInvitationCountDetails doctorInvitationCount) {
            if (response == null) {
                return new ThirdPartyLab();
            }

            return ThirdPartyLab.builder()
                    .orders(ReceivedOrders.from(response, growthPercentage))
                    .myTasks(CustomerOrdersTask.from(response.getTask()))
                    .needsAttention(NeedAttention.from(response))
                    .customerActionPending(CustomerActionPending.from(response))
                    .users(Users.from(doctorInvitationCount, response))
                    .build();
        }
    }
}
