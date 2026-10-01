package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.dashboardlabel.entity.DashboardLabels;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.order.dto.OrdersCountResponse;
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
public class DoctorDashboardResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private DashboardDetails dashboardDetails;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DashboardDetails implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private UserInfo userInfo;
        private PatientsSummary patientsSummary;
        private Summary practiceSummary;
        private Summary labsSummary;
        private PendingTasks pendingTasks;
        private ActivePracticeOrders activePracticeOrders;
        private OrdersSent ordersSent;
        private OrdersReceived ordersReceived;
        private ActiveOrdersSent activeOrdersSent;
        private OngoingOrders ongoingOrders;
        private ProfessionalPlanWorkspaceMyTask professionalPlanWorkspaceMyTask;
        private ProfessionalPlanCustomerViewMyTask professionalPlanCustomerViewMyTask;
        private GrowthAndStarterPlanMyTask growthAndStarterPlanMyTask;
        private PracticeConnectedToOrgMyTask practiceConnectedToOrgMyTask;
        private PatientCompliance patientCompliance;
        private LabelName labelName;
        private OrdersCountResponse sentOrderAllDetails;
        private OrdersCountResponse receivedOrderAllDetails;

        private EnterprisePlanDetails enterprisePlanDetails;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UserInfo implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String displayName;
        private String profileId;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PatientsSummary implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

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

            int completedPatients = Math.max(0, totalPatients - (activePatients + leadPatients));

            return PatientsSummary.builder()
                    .allPatients(totalPatients)
                    .inAssessment(inAssessmentLeads)
                    .inPlanning(inPlanningLeads)
                    .trackingPending(trackingPendingLeads)
                    .startingSoon(startingSoonTreatments)
                    .ongoing(ongoingTreatments)
                    .paused(pausedTreatments)
                    .inRefinement(inRefinementTreatments)
                    .completed(completedPatients)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Summary implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer total;

        public static Summary from(int total) {
            return Summary.builder().total(total).build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PendingTasks implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer workspace;
        private Integer customerView;

        public static PendingTasks from(
                OrdersCountResponse sentOrdersCount,
                DoctorDashboardCount dashboardCount,
                DoctorRole doctorRole,
                DoctorDashboardResponse.ProfessionalPlanWorkspaceMyTask professionalPlanWorkspaceMyTask,
                DoctorDashboardResponse.PracticeConnectedToOrgMyTask practiceConnectedToOrgMyTask,
                DoctorDashboardResponse.GrowthAndStarterPlanMyTask growthAndStarterPlanMyTask,
                DoctorDashboardResponse.ProfessionalPlanCustomerViewMyTask professionalPlanCustomerViewMyTask,
                ProfileType profileType) {

            int practiceConnectedToOrgMyTaskTotalPending = Optional.ofNullable(
                            practiceConnectedToOrgMyTask.getTotalPending())
                    .orElse(0);
            int growthAndStarterPlanMyTaskTotalPending = Optional.ofNullable(
                            growthAndStarterPlanMyTask.getTotalPending())
                    .orElse(0);
            int professionalPlanWorkspaceMyTaskTotalPending = Optional.ofNullable(
                            professionalPlanWorkspaceMyTask.getTotalPending())
                    .orElse(0);

            int workspaceTotal = Optional.ofNullable(dashboardCount.getPatientCompliance())
                    .map(compliance ->
                            compliance.getNeedsAttention() + compliance.getAtRisk() + compliance.getOnTrack())
                    .orElse(0);

            int customerViewTotal = Optional.ofNullable(sentOrdersCount.getNeedsAttention())
                    .map(needsAttention -> {
                        int dueToday = Optional.ofNullable(needsAttention.getDueToday())
                                .map(Math::toIntExact)
                                .orElse(0);
                        int overdue = Optional.ofNullable(needsAttention.getOverdue())
                                .map(Math::toIntExact)
                                .orElse(0);
                        return professionalPlanCustomerViewMyTask.getTotalPending() + dueToday + overdue;
                    })
                    .orElse(0);

            int additionalPending = 0;

            if (doctorRole == DoctorRole.CONSULTING_ORTHODONTIST && profileType == ProfileType.INVITED) {
                additionalPending += practiceConnectedToOrgMyTaskTotalPending;
            } else if (doctorRole == DoctorRole.IN_OFFICE_MANUFACTURER) {
                additionalPending += growthAndStarterPlanMyTaskTotalPending;
            } else if (doctorRole == DoctorRole.ALIGNER_COMPANY_OR_LAB) {
                additionalPending += professionalPlanWorkspaceMyTaskTotalPending;
            }

            return PendingTasks.builder()
                    .workspace(workspaceTotal + additionalPending)
                    .customerView(customerViewTotal)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ActivePracticeOrders implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer total;
        private double growthPercentage;
        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer approved;
        private Integer inRePlan;
        private Integer completed;

        public static ActivePracticeOrders from(OrdersCountResponse.Count count, Double growthPercentage) {
            int ordered = 0;
            int inReview = 0;
            int inProgress = 0;
            int approved = 0;
            int inRePlan = 0;
            int completed = 0;
            int total = 0;

            if (count != null) {
                if (count.getOrdered() != null) {
                    ordered = Math.toIntExact(count.getOrdered());
                }
                if (count.getInReview() != null) {
                    inReview = Math.toIntExact(count.getInReview());
                }
                if (count.getApproved() != null) {
                    approved = Math.toIntExact(count.getApproved());
                }
                if (count.getReplan() != null) {
                    inRePlan = Math.toIntExact(count.getReplan());
                }
                if (count.getInProgress() != null) {
                    inRePlan = Math.toIntExact(count.getInProgress());
                }
                if (count.getCompleted() != null) {
                    inRePlan = Math.toIntExact(count.getCompleted());
                }
                total = ordered + inProgress + inReview + approved + inRePlan + completed;
            }

            return ActivePracticeOrders.builder()
                    .total(total)
                    .growthPercentage(growthPercentage != null ? growthPercentage : 0.0)
                    .ordered(ordered)
                    .inProgress(inProgress)
                    .inReview(inReview)
                    .approved(approved)
                    .inRePlan(inRePlan)
                    .completed(completed)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrdersSent implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer total;
        private Integer ongoing;
        private Integer completed;
        private Integer inProgress;
        private double growthPercentage;

        public static OrdersSent from(OrdersCountResponse.Count count, Double growthPercentage, Integer totalOngoing) {
            int completed = 0;
            int inProgress = 0;

            if (count != null) {
                if (count.getCompleted() != null) {
                    completed = Math.toIntExact(count.getCompleted());
                }
                if (count.getInProgress() != null) {
                    inProgress = Math.toIntExact(count.getInProgress());
                }
            }

            return OrdersSent.builder()
                    .total(totalOngoing + completed)
                    .ongoing(totalOngoing)
                    .completed(completed)
                    .inProgress(inProgress)
                    .growthPercentage(growthPercentage != null ? growthPercentage : 0.0)
                    .build();
        }

        private static int getTotal(OrdersCountResponse.Count count) {
            int ordered = 0;
            int inReview = 0;
            int approved = 0;
            int stlFilesRequested = 0;
            int stlFilesApproved = 0;
            int inRePlan = 0;

            if (count != null) {
                if (count.getOrdered() != null) {
                    ordered = Math.toIntExact(count.getOrdered());
                }
                if (count.getInReview() != null) {
                    inReview = Math.toIntExact(count.getInReview());
                }
                if (count.getApproved() != null) {
                    approved = Math.toIntExact(count.getApproved());
                }
                if (count.getStlFileRequested() != null) {
                    stlFilesRequested = Math.toIntExact(count.getStlFileRequested());
                }
                if (count.getStlFileApproved() != null) {
                    stlFilesApproved = Math.toIntExact(count.getStlFileApproved());
                }
                if (count.getReplan() != null) {
                    inRePlan = Math.toIntExact(count.getReplan());
                }
            }
            return ordered + inReview + approved + stlFilesRequested + stlFilesApproved + inRePlan;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrdersReceived implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer received;
        private double growthPercentage;

        public static OrdersReceived from(OrdersCountResponse.Count count, Double growthPercentage) {
            int total = Optional.ofNullable(count)
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
    public static class ActiveOrdersSent implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer total;
        private Integer ordered;
        private Integer inReview;
        private Integer approved;
        private Integer stlFilesRequested;
        private Integer stlFilesApproved;
        private Integer inRePlan;
        private Integer draft;

        public static ActiveOrdersSent from(OrdersCountResponse.Count count) {
            int ordered = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getOrdered)
                    .map(Math::toIntExact)
                    .orElse(0);
            int inReview = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getInReview)
                    .map(Math::toIntExact)
                    .orElse(0);
            int approved = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getApproved)
                    .map(Math::toIntExact)
                    .orElse(0);
            int stlFilesRequested = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getStlFileRequested)
                    .map(Math::toIntExact)
                    .orElse(0);
            int stlFilesApproved = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getStlFileApproved)
                    .map(Math::toIntExact)
                    .orElse(0);
            int inRePlan = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getReplan)
                    .map(Math::toIntExact)
                    .orElse(0);

            int total = ordered + inReview + approved + stlFilesRequested + stlFilesApproved + inRePlan;

            return ActiveOrdersSent.builder()
                    .total(total)
                    .ordered(ordered)
                    .inReview(inReview)
                    .approved(approved)
                    .stlFilesRequested(stlFilesRequested)
                    .stlFilesApproved(stlFilesApproved)
                    .inRePlan(inRePlan)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OngoingOrders implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer total;
        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer approved;
        private Integer completed;
        private Integer inRePlan;

        public static OngoingOrders from(OrdersCountResponse.Count count) {
            int ordered = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getOrdered)
                    .map(Math::toIntExact)
                    .orElse(0);
            int inProgress = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getInProgress)
                    .map(Math::toIntExact)
                    .orElse(0);
            int inReview = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getInReview)
                    .map(Math::toIntExact)
                    .orElse(0);
            int approved = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getApproved)
                    .map(Math::toIntExact)
                    .orElse(0);
            int completed = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getCompleted)
                    .map(Math::toIntExact)
                    .orElse(0);
            int inRePlan = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getReplan)
                    .map(Math::toIntExact)
                    .orElse(0);

            int total = ordered + inProgress + inReview + approved + completed + inRePlan;

            return OngoingOrders.builder()
                    .total(total)
                    .ordered(ordered)
                    .inProgress(inProgress)
                    .inReview(inReview)
                    .approved(approved)
                    .completed(completed)
                    .inRePlan(inRePlan)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PatientCompliance implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer needsAttention;
        private Integer atRisk;
        private Integer onTrack;
        private Integer total;

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
                    .total(needsAttention + atRisk + onTrack)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ProfessionalPlanWorkspaceMyTask implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer totalPending;
        private Integer newOrders;
        private Integer confirmAndSendTreatmentPlans;
        private Integer inReplan;
        private Integer dueToday;
        private Integer overdue;
        private Integer notAddedDueBy;

        public static ProfessionalPlanWorkspaceMyTask from(OrdersCountResponse receivedOrderCount) {
            int newOrders = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getOrdered)
                    .map(Math::toIntExact)
                    .orElse(0);
            int replan = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getNeedsAttention)
                    .map(OrdersCountResponse.NeedsAttentionDetails::getInReplan)
                    .map(Math::toIntExact)
                    .orElse(0);
            int overdueTasks = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getNeedsAttention)
                    .map(OrdersCountResponse.NeedsAttentionDetails::getOverdue)
                    .map(Math::toIntExact)
                    .orElse(0);
            int confirmAndSendTreatmentPlans = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getInProgress)
                    .map(Math::toIntExact)
                    .orElse(0);
            int dueTodayTasks = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getNeedsAttention)
                    .map(OrdersCountResponse.NeedsAttentionDetails::getDueToday)
                    .map(Math::toIntExact)
                    .orElse(0);
            int notAddedDueBy = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getNotAddedDueByCount)
                    .map(Math::toIntExact)
                    .orElse(0);

            int totalPending =
                    newOrders + replan + overdueTasks + confirmAndSendTreatmentPlans + dueTodayTasks + notAddedDueBy;

            return ProfessionalPlanWorkspaceMyTask.builder()
                    .newOrders(newOrders)
                    .inReplan(replan)
                    .overdue(overdueTasks)
                    .confirmAndSendTreatmentPlans(confirmAndSendTreatmentPlans)
                    .dueToday(dueTodayTasks)
                    .totalPending(totalPending)
                    .notAddedDueBy(notAddedDueBy)
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
                    .map(OrdersCountResponse.Count::getStlFileRequested)
                    .map(Math::toIntExact)
                    .orElse(0);
            int reviewApproveStlFiles = Optional.ofNullable(sentOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getStlFileApproved)
                    .map(Math::toIntExact)
                    .orElse(0);

            int totalPending =
                    confirmAndSendDraftOrders + approveTreatmentPlan + requestStlFiles + reviewApproveStlFiles;

            return ProfessionalPlanCustomerViewMyTask.builder()
                    .confirmAndSendDraftOrders(confirmAndSendDraftOrders)
                    .approveTreatmentPlan(approveTreatmentPlan)
                    .requestStlFiles(requestStlFiles)
                    .reviewApproveStlFiles(reviewApproveStlFiles)
                    .totalPending(totalPending)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PracticeConnectedToOrgMyTask implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer totalPending;
        private Integer alignerUpdates;
        private Integer todaysAppointments;
        private Integer completeAssessment;
        private Integer confirmAndSendCases;
        private Integer approveTreatmentPlan;
        private Integer finalizeTreatmentPlan;
        private Integer resumePausedTreatments;
        private Integer createNewRefinementPlan;

        public static PracticeConnectedToOrgMyTask from(
                DoctorDashboardCount dashboardCount, OrdersCountResponse sentOrdersCount) {
            int alignerUpdates = Optional.ofNullable(dashboardCount.getAlignerActionCounts())
                    .map(DoctorDashboardCount.AlignerUpdateCounts::getTotal)
                    .map(Math::toIntExact)
                    .orElse(0);
            int todaysAppointments = Optional.ofNullable(dashboardCount.getAppointmentCounts())
                    .map(DoctorDashboardCount.AppointmentCounts::getTodaysAppointment)
                    .map(Math::toIntExact)
                    .orElse(0);
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
                    + todaysAppointments
                    + approveTreatmentPlan;

            return PracticeConnectedToOrgMyTask.builder()
                    .alignerUpdates(alignerUpdates)
                    .todaysAppointments(todaysAppointments)
                    .completeAssessment(completeAssessment)
                    .confirmAndSendCases(confirmAndSendCases)
                    .approveTreatmentPlan(approveTreatmentPlan)
                    .finalizeTreatmentPlan(finalizeTreatmentPlan)
                    .resumePausedTreatments(resumePausedTreatments)
                    .createNewRefinementPlan(createNewRefinementPlan)
                    .totalPending(totalPending)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class GrowthAndStarterPlanMyTask implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer totalPending;
        private Integer alignerUpdates;
        private Integer todaysAppointments;
        private Integer completeAssessment;
        private Integer finalizeTreatmentPlan;
        private Integer resumePausedTreatments;
        private Integer createNewRefinementPlan;
        private Integer confirmAndSendCases;
        private Integer approveTreatmentPlan;

        public static GrowthAndStarterPlanMyTask from(
                DoctorDashboardCount dashboardCount, OrdersCountResponse sentOrdersCount) {
            int alignerUpdates = Optional.ofNullable(dashboardCount.getAlignerActionCounts())
                    .map(DoctorDashboardCount.AlignerUpdateCounts::getTotal)
                    .map(Math::toIntExact)
                    .orElse(0);

            int todaysAppointments = Optional.ofNullable(dashboardCount.getAppointmentCounts())
                    .map(DoctorDashboardCount.AppointmentCounts::getTodaysAppointment)
                    .map(Math::toIntExact)
                    .orElse(0);

            int completeAssessment = Optional.ofNullable(dashboardCount.getLeadCount())
                    .map(DoctorDashboardCount.TreatmentCount::getInAssessment)
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

            int approveTreatmentPlan = Optional.ofNullable(sentOrdersCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getInProgress)
                    .map(Math::toIntExact)
                    .orElse(0);

            int confirmAndSendCases = Optional.ofNullable(sentOrdersCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getDraft)
                    .map(Math::toIntExact)
                    .orElse(0);

            int totalPending = alignerUpdates
                    + todaysAppointments
                    + completeAssessment
                    + finalizeTreatmentPlan
                    + resumePausedTreatments
                    + createNewRefinementPlan;

            return GrowthAndStarterPlanMyTask.builder()
                    .alignerUpdates(alignerUpdates)
                    .todaysAppointments(todaysAppointments)
                    .completeAssessment(completeAssessment)
                    .finalizeTreatmentPlan(finalizeTreatmentPlan)
                    .resumePausedTreatments(resumePausedTreatments)
                    .createNewRefinementPlan(createNewRefinementPlan)
                    .totalPending(totalPending)
                    .confirmAndSendCases(confirmAndSendCases)
                    .approveTreatmentPlan(approveTreatmentPlan)
                    .build();
        }
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
        private String labelView;

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
                    .labelView("Lab orders")
                    .build();
        }

        public static LabelName from(DashboardLabels labels) {
            return LabelName.builder()
                    .home(labels.getHome())
                    .workspace(labels.getWorkspace())
                    .customerView(labels.getCustomerView())
                    .labelView(labels.getLabView())
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EnterprisePlanDetails implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private PracticeOrders homePracticeOrderMetrics;
        private CustomerOrders homeCustomerOrdersMetrics;
        private OrdersSentToLab homeLabOrderMetrics;
        private WorkspaceMetrics workspaceMetrics;
        private LabMetrics labMetrics;
        private OrdersCountResponse customerMetrics;

        public static EnterprisePlanDetails from(
                PracticeOrders alignerOrders,
                CustomerOrders planningOrders,
                OrdersSentToLab ordersSentToLab,
                WorkspaceMetrics workspaceMetrics,
                OrdersCountResponse ordersCountResponse,
                LabMetrics labMetrics) {
            return EnterprisePlanDetails.builder()
                    .homePracticeOrderMetrics(alignerOrders)
                    .homeLabOrderMetrics(ordersSentToLab)
                    .homeCustomerOrdersMetrics(planningOrders)
                    .workspaceMetrics(workspaceMetrics)
                    .customerMetrics(ordersCountResponse)
                    .labMetrics(labMetrics)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PracticeOrders implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer pendingUpdates;
        private Integer patients;
        private Integer practiceCount;
        private Integer orderReceivedByPractice;
        private double orderReceivedByPracticePercentage;
        private ActivePracticeOrdersForEnterprise activePracticeOrders;
        private PatientTreatmentStage patientTreatmentStage;

        public static PracticeOrders from(
                int pendingUpdates,
                int patients,
                int practiceCount,
                int orderReceivedByPractice,
                double orderReceivedByPracticePercentage,
                ActivePracticeOrdersForEnterprise activePracticeOrders,
                PatientTreatmentStage patientTreatmentStage) {
            return PracticeOrders.builder()
                    .pendingUpdates(pendingUpdates)
                    .patients(patients)
                    .practiceCount(practiceCount)
                    .orderReceivedByPractice(orderReceivedByPractice)
                    .orderReceivedByPracticePercentage(orderReceivedByPracticePercentage)
                    .activePracticeOrders(activePracticeOrders)
                    .patientTreatmentStage(patientTreatmentStage)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivePracticeOrdersForEnterprise implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer total;
        private double growthPercentage;
        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer approved;
        private Integer inRePlan;
        private Integer completed;

        public static ActivePracticeOrdersForEnterprise from(OrdersCountResponse.Count count, Double growthPercentage) {
            int ordered = 0;
            int inProgress = 0;
            int inReview = 0;
            int approved = 0;
            int inRePlan = 0;
            int completed = 0;
            int total = 0;

            if (count != null) {
                if (count.getOrdered() != null) {
                    ordered = Math.toIntExact(count.getOrdered());
                }
                if (count.getInReview() != null) {
                    inReview = Math.toIntExact(count.getInReview());
                }
                if (count.getApproved() != null) {
                    approved = Math.toIntExact(count.getApproved());
                }
                if (count.getReplan() != null) {
                    inRePlan = Math.toIntExact(count.getReplan());
                }
                if (count.getInProgress() != null) {
                    inProgress = Math.toIntExact(count.getInProgress());
                }
                if (count.getCompleted() != null) {
                    completed = Math.toIntExact(count.getCompleted());
                }
                total = ordered + inProgress + inReview + approved + inRePlan + completed;
            }

            return ActivePracticeOrdersForEnterprise.builder()
                    .total(total)
                    .growthPercentage(growthPercentage != null ? growthPercentage : 0.0)
                    .ordered(ordered)
                    .inProgress(inProgress)
                    .inReview(inReview)
                    .approved(approved)
                    .inRePlan(inRePlan)
                    .completed(completed)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientTreatmentStage implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer total;
        private Integer totalPatients;
        private Integer inAssessment;
        private Integer inPlanning;
        private Integer trackingPending;
        private Integer startingSoon;
        private Integer ongoing;
        private Integer completed;
        private Integer paused;
        private Integer refinement;

        public static PatientTreatmentStage from(DoctorDashboardCount dashboardCount) {
            int totalPatients = Optional.ofNullable(dashboardCount.getPatientCount())
                    .map(DoctorDashboardCount.PatientCount::getTotal)
                    .orElse(0);
            int inAssessment = Optional.ofNullable(dashboardCount.getLeadCount())
                    .map(DoctorDashboardCount.TreatmentCount::getInAssessment)
                    .orElse(0);
            int inPlanning = Optional.ofNullable(dashboardCount.getLeadCount())
                    .map(DoctorDashboardCount.TreatmentCount::getInPlanning)
                    .orElse(0);
            int trackingPending = Optional.ofNullable(dashboardCount.getLeadCount())
                    .map(DoctorDashboardCount.TreatmentCount::getTrackingPending)
                    .orElse(0);
            int startingSoon = Optional.ofNullable(dashboardCount.getAllTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getStartingSoon)
                    .orElse(0);
            int ongoing = Optional.ofNullable(dashboardCount.getAllTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getOngoing)
                    .orElse(0);
            int completed = Optional.ofNullable(dashboardCount.getAllTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getTotal)
                    .orElse(0);
            int paused = Optional.ofNullable(dashboardCount.getAlignerTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getPaused)
                    .orElse(0);
            int refinement = Optional.ofNullable(dashboardCount.getAlignerTreatments())
                    .map(DoctorDashboardCount.TreatmentStageCount::getRefinement)
                    .orElse(0);

            return PatientTreatmentStage.builder()
                    .totalPatients(totalPatients)
                    .inAssessment(inAssessment)
                    .inPlanning(inPlanning)
                    .trackingPending(trackingPending)
                    .startingSoon(startingSoon)
                    .ongoing(ongoing)
                    .completed(completed)
                    .paused(paused)
                    .refinement(refinement)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerOrders implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        @Builder.Default
        private Long pendingUpdates = 0L;

        private Integer patients;
        private Integer customerCounts;
        private Integer orderReceivedByCustomer;
        private Double orderReceivedByCustomerPercentage;
        private ActiveCustomerOrders activeCustomerOrders;

        public static CustomerOrders from(
                long pendingUpdates,
                int patients,
                int customerCounts,
                int orderReceivedByCustomer,
                double orderReceivedByCustomerPercentage,
                ActiveCustomerOrders activeCustomerOrders) {
            return CustomerOrders.builder()
                    .pendingUpdates(pendingUpdates)
                    .patients(patients)
                    .customerCounts(customerCounts)
                    .orderReceivedByCustomer(orderReceivedByCustomer)
                    .orderReceivedByCustomerPercentage(orderReceivedByCustomerPercentage)
                    .activeCustomerOrders(activeCustomerOrders)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActiveCustomerOrders implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer total;
        private Integer inReview;
        private Integer ordered;
        private Integer approved;
        private Integer stlFileApproved;
        private Integer stlFileRequested;
        private Integer inRePlan;

        public static ActiveCustomerOrders from(OrdersCountResponse.Count count) {
            int ordered = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getOrdered)
                    .map(Math::toIntExact)
                    .orElse(0);
            int inReview = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getInReview)
                    .map(Math::toIntExact)
                    .orElse(0);
            int approved = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getApproved)
                    .map(Math::toIntExact)
                    .orElse(0);
            int stlFilesRequested = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getStlFileRequested)
                    .map(Math::toIntExact)
                    .orElse(0);
            int stlFilesApproved = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getStlFileApproved)
                    .map(Math::toIntExact)
                    .orElse(0);
            int inRePlan = Optional.ofNullable(count)
                    .map(OrdersCountResponse.Count::getReplan)
                    .map(Math::toIntExact)
                    .orElse(0);

            int total = ordered + inReview + approved + stlFilesRequested + stlFilesApproved + inRePlan;

            return ActiveCustomerOrders.builder()
                    .total(total)
                    .ordered(ordered)
                    .inReview(inReview)
                    .approved(approved)
                    .stlFileRequested(stlFilesRequested)
                    .stlFileApproved(stlFilesApproved)
                    .inRePlan(inRePlan)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrdersSentToLab implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Long pendingUpdates;
        private Long patients;
        private Integer labsCounts;
        private Long orderSent;
        private double growthPercentage;
        private OrdersCountResponse.Count sentOrdersCount;

        public static OrdersSentToLab from(
                Long pendingUpdates,
                Long patients,
                int labsCounts,
                Long orderSent,
                double growthPercentage,
                OrdersCountResponse.Count sentOrdersCount) {
            return OrdersSentToLab.builder()
                    .pendingUpdates(pendingUpdates)
                    .patients(patients)
                    .labsCounts(labsCounts)
                    .orderSent(orderSent)
                    .growthPercentage(growthPercentage)
                    .sentOrdersCount(sentOrdersCount)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkspaceMetrics implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private ProfessionalPlanWorkspaceMyTask workspaceGlobalMetrics;
        private PatientsSummary workspacePatientSummary;
        private OngoingOrders workspaceOngoingOrders;
        private PatientCompliance workspacePatientCompliance;

        public static WorkspaceMetrics from(
                ProfessionalPlanWorkspaceMyTask workspaceGlobalMetrics,
                PatientsSummary workspacePatientSummary,
                OngoingOrders workspaceOngoingOrders,
                PatientCompliance workspacePatientCompliance) {
            return WorkspaceMetrics.builder()
                    .workspaceGlobalMetrics(workspaceGlobalMetrics)
                    .workspacePatientSummary(workspacePatientSummary)
                    .workspaceOngoingOrders(workspaceOngoingOrders)
                    .workspacePatientCompliance(workspacePatientCompliance)
                    .build();
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class LabMetrics implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Integer total;
        private Integer draft;
        private Integer ordered;
        private Integer inProgress;
        private Integer inReview;
        private Integer inReplan;
        private Integer approved;
        private Integer stlFileRequested;
        private Integer stlFileApproved;
        private Integer completed;
        private Integer totalPending;
        private Integer draftOrder;
        private Integer approveTreatmentPlans;
        private Integer requestStlFiles;
        private Integer reviewAndApproveStlFiles;
        private Integer dueToday;
        private Integer overdue;

        public static LabMetrics from(OrdersCountResponse receivedOrderCount) {
            int draft = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getDraft)
                    .map(Math::toIntExact)
                    .orElse(0);
            int ordered = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getOrdered)
                    .map(Math::toIntExact)
                    .orElse(0);
            int inProgress = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getInProgress)
                    .map(Math::toIntExact)
                    .orElse(0);
            int replan = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getNeedsAttention)
                    .map(OrdersCountResponse.NeedsAttentionDetails::getInReplan)
                    .map(Math::toIntExact)
                    .orElse(0);
            int overdueTasks = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getNeedsAttention)
                    .map(OrdersCountResponse.NeedsAttentionDetails::getOverdue)
                    .map(Math::toIntExact)
                    .orElse(0);
            int dueTodayTasks = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getNeedsAttention)
                    .map(OrdersCountResponse.NeedsAttentionDetails::getDueToday)
                    .map(Math::toIntExact)
                    .orElse(0);
            int inReview = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getInReview)
                    .map(Math::toIntExact)
                    .orElse(0);
            int approved = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getApproved)
                    .map(Math::toIntExact)
                    .orElse(0);
            int stlFileRequested = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getStlFileRequested)
                    .map(Math::toIntExact)
                    .orElse(0);

            int stlFileApproved = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getStlFileApproved)
                    .map(Math::toIntExact)
                    .orElse(0);

            int completed = Optional.ofNullable(receivedOrderCount)
                    .map(OrdersCountResponse::getCount)
                    .map(OrdersCountResponse.Count::getCompleted)
                    .map(Math::toIntExact)
                    .orElse(0);

            int totalPending = draft + inReview + approved + stlFileApproved;

            int total = draft
                    + ordered
                    + inProgress
                    + inReview
                    + replan
                    + approved
                    + stlFileRequested
                    + stlFileApproved
                    + completed;

            return LabMetrics.builder()
                    .total(total)
                    .draft(draft)
                    .ordered(ordered)
                    .inProgress(inProgress)
                    .inReview(inReview)
                    .inReplan(replan)
                    .approved(approved)
                    .stlFileRequested(stlFileRequested)
                    .stlFileApproved(stlFileApproved)
                    .completed(completed)
                    .draftOrder(draft)
                    .approveTreatmentPlans(inReview)
                    .requestStlFiles(approved)
                    .reviewAndApproveStlFiles(stlFileApproved)
                    .overdue(overdueTasks)
                    .dueToday(dueTodayTasks)
                    .totalPending(totalPending)
                    .build();
        }
    }
}
