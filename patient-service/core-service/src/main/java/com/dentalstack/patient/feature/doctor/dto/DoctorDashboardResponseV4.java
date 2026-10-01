package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.aligner.dto.analytics.AlignerAnalyticsCountResponse;
import com.dentalstack.patient.feature.aligner.projection.AlignerAnalyticsCounts;
import com.dentalstack.patient.feature.aligner.projection.PatientDueStatusCounts;
import com.dentalstack.patient.feature.doctor.projection.AppInviteStatusCount;
import com.dentalstack.patient.feature.doctor.projection.PlanningPatientInfoProjection;
import com.dentalstack.patient.feature.patient.dto.PatientCountResponse;
import com.dentalstack.patient.feature.patient.dto.PatientDetailsList;
import com.dentalstack.patient.feature.subcription.enums.PlanName;
import com.dentalstack.patient.feature.user.entity.User;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.WorkflowKanbanSummaryResponse;
import com.dentalstack.patient.feature.workflow.core.workflows.projection.AssigneeDistributionProjection;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorDashboardResponseV4 implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private DashboardDetails dashboardDetails;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DashboardDetails implements Serializable {
        private StarterPlan starterPlan;
        private GrowthPlan growthPlan;
        private PracticeConnectedToOrg practiceConnectedToOrg;
        private EnterprisePlan enterprisePlan;
        private InternalUserPlan internalUserPlan;
        private Boolean isCustomerTrackingEnabled;
        private Boolean isCustomerStlFileViewEnabled;
        private Boolean isCustomerScanFileViewEnabled;
        private Boolean isCustomerPrintFileViewEnabled;
        private EnterprisePlanning enterprisePlanningUser;
        private EnterprisePlanning enterpriseManufacturingUser;
        private PlanningPractice planningPractice;
        private PlanningPractice vspCustomer;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class StarterPlan implements Serializable {
        private StarterPatientsSummary patientsSummary;
        private StaterPlanCoreTask coreTask;
        private Long unreadNotificationCount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class StaterPlanCoreTask implements Serializable {
        private Long alignerChangeAndCheckin;
        private Long invitationPending;
        private Integer needsAttention;
        private Integer atRisk;
        private Long addAppointmentNotes;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class StarterPatientsSummary implements Serializable {
        private Integer activePatientsUnderCare;
        private Long newCases;
        private Long ongoingCases;
        private Integer newCasesThisMonth;
        private Integer treatmentTrackingCount;
        private Integer pendingTask;
        private double caseAcceptanceRate;
        private Long aligner;
        private Long braces;

        public static DoctorDashboardResponseV4.StarterPatientsSummary from(
                PatientDetailsList dashboardCount, Long aligner, Long braces) {
            var patientCount = dashboardCount.getPatientCountResponse();

            Long ongoingCases = aligner + braces;

            double caseAcceptanceRate = 0.0;
            if (patientCount.getAllPatients() > 0) {
                caseAcceptanceRate = ((double) ongoingCases / patientCount.getAllPatients()) * 100;
            }
            Long newCases = patientCount.getAllPatients() - ongoingCases;

            var treatmentTrackingCount = patientCount.getStartingSoon()
                    + patientCount.getOngoing()
                    + patientCount.getTransit()
                    + patientCount.getPaused()
                    + patientCount.getCompleted();

            return StarterPatientsSummary.builder()
                    .activePatientsUnderCare(patientCount.getAllPatients())
                    .newCases(newCases)
                    .ongoingCases(ongoingCases)
                    .newCasesThisMonth(patientCount.getNewCasesThisMonthCount())
                    .treatmentTrackingCount(treatmentTrackingCount)
                    .aligner(aligner)
                    .braces(braces)
                    .caseAcceptanceRate(caseAcceptanceRate)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class GrowthPlan implements Serializable {
        private WorkflowKanbanSummaryResponse kanbanDetails;
        private List<AssigneeDistributionResponse> newCaseAssigneeDistribution;
        private List<AssigneeDistributionResponse> planningOperationAssigneeDistribution;
        private List<AssigneeDistributionResponse> productionOperationAssigneeDistribution;
        private List<AssigneeDistributionResponse> teamWorkloadOverview;
        private Unprocessed unprocessedBatches;
        private PatientsSummary patientsSummary;
        private TreatmentStage treatmentStage;
        private PatientCompliance patientCompliance;
        private AppConnectionStatus appConnectionStatus;
        private PendingUpdates pendingUpdates;
        private SectionCounts sectionCounts;
        private Long unreadNotificationCount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PracticeConnectedToOrg implements Serializable {
        private PracticeDashboardCounts counts;
        private Long unreadNotificationCount;

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class PracticeDashboardCounts implements Serializable {

            private Long draft;
            private Long planning;
            private Long needInfo;
            private Long approvalPending;
            private Long inRevision;
            private Long approved;
            private Long manufacturing;
            private Long shipped;

            private Long readyToStart;
            private Long onTrack;
            private Long needsAttention;
            private Long atRisk;

            private Long activeCases;
            private Long completed;
            private Long casesThisMonth;
            private Long casesLastMonth;
            private LocalDateTime lastActivityDate;
            private Long totalUnreadChatCount;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EnterprisePlan implements Serializable {
        private WorkflowKanbanSummaryResponse kanbanDetails;
        private List<AssigneeDistributionResponse> newCaseAssigneeDistribution;
        private List<AssigneeDistributionResponse> planningOperationAssigneeDistribution;
        private List<AssigneeDistributionResponse> productionOperationAssigneeDistribution;
        private List<AssigneeDistributionResponse> teamWorkloadOverview;
        private CoreTask coretask;

        private Unprocessed unprocessedBatches;
        private PatientsSummary patientsSummary;
        private TreatmentStage treatmentStage;
        private PatientCompliance patientCompliance;
        private AppConnectionStatus appConnectionStatus;
        private PendingUpdates pendingUpdates;
        private SectionCounts sectionCounts;
        private Long unreadNotificationCount;
        private Long totalUnreadChatCount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EnterprisePlanning implements Serializable {
        private WorkflowKanbanSummaryResponse kanbanDetails;
        private PlanName planName;
        private Long totalPatientCount;
        private Long totalUnreadChatCount;
        private Long unreadNotificationCount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class InternalUserPlan implements Serializable {
        private WorkflowKanbanSummaryResponse kanbanDetails;
        private Long totalPatientCount;
        private Long unreadNotificationCount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class AssigneeDistributionResponse {
        private String userName;
        private String role;
        private int caseCount;
        private double percentage;
        private String assigneeType;
        private Integer overdueCount;
        private Integer totalCounts;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Unprocessed implements Serializable {
        private Integer overdue;
        private Integer nextSevenDays;
        private Integer nextThirtyDays;

        public static Unprocessed from(PatientDueStatusCounts patientDueStatusCounts) {
            return Unprocessed.builder()
                    .overdue(patientDueStatusCounts.getOverdueCount())
                    .nextThirtyDays(patientDueStatusCounts.getNextThirtyDaysCount())
                    .nextSevenDays(patientDueStatusCounts.getNextSevenDaysCount())
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PatientsSummary implements Serializable {
        private Integer activePatientsUnderCare;
        private Integer newCases;
        private Integer ongoingCases;
        private Integer newCasesThisMonth;
        private Integer treatmentTrackingCount;
        private Integer pendingTask;
        private double caseAcceptanceRate;

        public static DoctorDashboardResponseV4.PatientsSummary from(PatientDetailsList dashboardCount) {
            var patientCount = dashboardCount.getPatientCountResponse();

            var ongoingCases = patientCount.getStartingSoon()
                    + patientCount.getOngoing()
                    + patientCount.getRefinement()
                    + patientCount.getPaused();
            var newCases = patientCount.getAllPatients() - ongoingCases;

            var treatmentTrackingCount = patientCount.getStartingSoon()
                    + patientCount.getOngoing()
                    + patientCount.getTransit()
                    + patientCount.getPaused()
                    + patientCount.getCompleted();

            return DoctorDashboardResponseV4.PatientsSummary.builder()
                    .activePatientsUnderCare(patientCount.getAllPatients())
                    .newCases(newCases)
                    .ongoingCases(ongoingCases)
                    .newCasesThisMonth(patientCount.getNewCasesThisMonthCount())
                    .treatmentTrackingCount(treatmentTrackingCount)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class TreatmentStage implements Serializable {
        private Integer startingSoon;
        private Integer ongoing;
        private Integer completed;
        private Integer paused;
        private Integer inRefinement;
        private Integer total;

        public static TreatmentStage from(PatientCountResponse dashboardCount) {
            var total = dashboardCount.getStartingSoon()
                    + dashboardCount.getOngoing()
                    + dashboardCount.getCompleted()
                    + dashboardCount.getPaused()
                    + dashboardCount.getRefinement();
            return TreatmentStage.builder()
                    .startingSoon(dashboardCount.getStartingSoon())
                    .ongoing(dashboardCount.getOngoing())
                    .completed(dashboardCount.getCompleted())
                    .paused(dashboardCount.getPaused())
                    .inRefinement(dashboardCount.getRefinement())
                    .total(total)
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
        private Integer total;

        public static DoctorDashboardResponseV4.PatientCompliance from(AlignerAnalyticsCounts alignerAnalyticsCounts) {

            int needsAttention = Optional.ofNullable(alignerAnalyticsCounts)
                    .map(AlignerAnalyticsCounts::getNeedsAttentionCount)
                    .orElse(0);
            int atRisk = Optional.ofNullable(alignerAnalyticsCounts)
                    .map(AlignerAnalyticsCounts::getAtRiskCount)
                    .orElse(0);
            int onTrack = Optional.ofNullable(alignerAnalyticsCounts)
                    .map(AlignerAnalyticsCounts::getOnTrackCount)
                    .orElse(0);
            int total = needsAttention + atRisk + onTrack;
            return DoctorDashboardResponseV4.PatientCompliance.builder()
                    .needsAttention(needsAttention)
                    .atRisk(atRisk)
                    .onTrack(onTrack)
                    .total(total)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class AppConnectionStatus {
        private Integer connected;
        private Integer pending;
        private Integer notConnected;
        private Integer total;

        public static AppConnectionStatus from(AppInviteStatusCount appConnectionStatus) {

            var total = Optional.ofNullable(appConnectionStatus)
                    .map(status ->
                            status.getConnectedCount() + status.getPendingCount() + status.getNotConnectedCount())
                    .orElse(0L);
            return AppConnectionStatus.builder()
                    .connected(Math.toIntExact(Optional.ofNullable(appConnectionStatus)
                            .map(AppInviteStatusCount::getConnectedCount)
                            .orElse(0L)))
                    .pending(Math.toIntExact(Optional.ofNullable(appConnectionStatus)
                            .map(AppInviteStatusCount::getPendingCount)
                            .orElse(0L)))
                    .notConnected(Math.toIntExact(Optional.ofNullable(appConnectionStatus)
                            .map(AppInviteStatusCount::getNotConnectedCount)
                            .orElse(0L)))
                    .total(Math.toIntExact(total))
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PendingUpdates implements Serializable {
        private Integer alignerChanges;
        private Integer alignerCheckIns;
        private Integer issueReported;
        private Integer total;
        private Integer chatPending;
        private Long uniquePatientsWithPendingUpdates;

        public static PendingUpdates from(AlignerAnalyticsCountResponse response) {
            var total = Optional.ofNullable(response)
                    .map(r -> r.getTotalAlignerChanges() + r.getTotalAlignerCheckIns() + r.getTotalIssuesReported())
                    .orElse(0);
            return PendingUpdates.builder()
                    .alignerChanges(Optional.ofNullable(response)
                            .map(AlignerAnalyticsCountResponse::getTotalAlignerChanges)
                            .orElse(0))
                    .alignerCheckIns(Optional.ofNullable(response)
                            .map(AlignerAnalyticsCountResponse::getTotalAlignerCheckIns)
                            .orElse(0))
                    .issueReported(Optional.ofNullable(response)
                            .map(AlignerAnalyticsCountResponse::getTotalIssuesReported)
                            .orElse(0))
                    .uniquePatientsWithPendingUpdates(Optional.ofNullable(response)
                            .map(AlignerAnalyticsCountResponse::getUniquePatientWithActionCounts)
                            .orElse(0L))
                    .total(total)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CoreTask implements Serializable {
        private Integer newCase;
        private Long approvePlan;
        private Long moveToProduction;
        private Integer startingSoon;
        private Long alignerChangesAndCheckIns;
        private Long invitationPending;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PracticePerformance implements Serializable {
        private double averageTreatmentDuration;
        private double reCareAppointmentScheduled;
        private double patientRetentionRate;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class SectionCounts implements Serializable {
        private Integer newCaseOperationCount;
        private Integer planningOperationCount;
        private Integer productionOperationCount;
        private Integer treatmentTrackingCount;
        private Integer inHousePlanningCount;
        private Integer outsourcePlanningCount;
        private Integer inHouseProductionCount;
        private Integer outsourceProductionCount;

        public static DoctorDashboardResponseV4.SectionCounts from(
                Integer newCaseOperationCount,
                Integer planningOperationCount,
                Integer treatmentTrackingCount,
                AssigneeDistributionProjection kanbanIndividualCount) {
            var productionOperationCounts = kanbanIndividualCount.getProductionInHouseCount()
                    + kanbanIndividualCount.getProductionOutsourceCount()
                    + kanbanIndividualCount.getOngoingProductListCount();
            return SectionCounts.builder()
                    .newCaseOperationCount(newCaseOperationCount)
                    .planningOperationCount(planningOperationCount)
                    .productionOperationCount(productionOperationCounts)
                    .treatmentTrackingCount(treatmentTrackingCount)
                    .inHousePlanningCount(kanbanIndividualCount.getPlanningInHouseCount())
                    .outsourcePlanningCount(kanbanIndividualCount.getPlanOutsourceCount())
                    .inHouseProductionCount(kanbanIndividualCount.getProductionInHouseCount())
                    .outsourceProductionCount(kanbanIndividualCount.getProductionOutsourceCount())
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PlanningPractice implements Serializable {

        private PlanningCounts counts;

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class PlanningCounts implements Serializable {
            private Long active;
            private Long draft;
            private Long needInfo;
            private Long inProgress;
            private Long inReview;
            private Long inRevision;
            private Long approved;
            private Long completed;
            private Long casesThisMonth;
            private Long casesLastMonth;
            private LocalDateTime lastActivityDate;
            private Long totalUnreadChatCount;
            private Long unreadNotificationCount;
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class PlanningPatientInfo implements Serializable {
            private String patientId;
            private String fullName;
            private String firstName;
            private String lastName;
            private String profilePictureUrl;
            private Long profileImageId;
            private String labName;

            public static PlanningPatientInfo from(PlanningPatientInfoProjection p) {
                return PlanningPatientInfo.builder()
                        .patientId(p.getPatientId() != null ? p.getPatientId().toString() : null)
                        .fullName(buildFullName(p.getFirstName(), p.getLastName()))
                        .firstName(p.getFirstName())
                        .lastName(p.getLastName())
                        .profilePictureUrl(p.getProfilePictureUrl())
                        .profileImageId(p.getProfileImageId())
                        .labName(User.getFullNameWithSalutation(
                                p.getLabSalutation(), p.getLabFirstName(), p.getLabLastName()))
                        .build();
            }

            private static String buildFullName(String firstName, String lastName) {
                if (lastName != null && !lastName.isBlank()) {
                    return firstName != null ? firstName + " " + lastName : lastName;
                }
                return firstName != null ? firstName : "";
            }
        }
    }
}
