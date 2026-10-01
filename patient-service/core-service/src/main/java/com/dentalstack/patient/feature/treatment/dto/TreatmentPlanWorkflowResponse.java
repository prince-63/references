package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanProfileSummary;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.*;
import org.springframework.data.domain.Page;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentPlanWorkflowResponse {
    private Integer totalPlans;
    private Integer approved;
    private Integer pendingApproval;
    private Long totalFilesCount;
    private List<TreatmentPlanResponse> plansList;
    private PaginationDetails paginationDetails;

    public static TreatmentPlanWorkflowResponse from(List<TreatmentPlan> treatmentPlanList) {
        if (treatmentPlanList == null || treatmentPlanList.isEmpty()) {
            return TreatmentPlanWorkflowResponse.builder()
                    .totalPlans(0)
                    .approved(0)
                    .pendingApproval(0)
                    .totalFilesCount(0L)
                    .plansList(Collections.emptyList())
                    .build();
        }

        List<TreatmentPlanResponse> responses = treatmentPlanList.stream()
                .filter(Objects::nonNull)
                .map(TreatmentPlanResponse::from)
                .collect(Collectors.toList());

        int totalPlans = responses.size();

        int approvedCount = (int) treatmentPlanList.stream()
                .filter(Objects::nonNull)
                .filter(plan -> plan.getApproverStatus() == OrderTreatmentPlanStatus.APPROVED
                        || plan.getInitiatorStatus() == OrderTreatmentPlanStatus.APPROVED)
                .count();

        int pendingApprovalCount = (int) treatmentPlanList.stream()
                .filter(Objects::nonNull)
                .filter(plan -> plan.getApproverStatus() == OrderTreatmentPlanStatus.PENDING_APPROVAL
                        || plan.getInitiatorStatus() == OrderTreatmentPlanStatus.PENDING_APPROVAL)
                .count();

        long totalFilesCount = responses.stream()
                .filter(Objects::nonNull)
                .mapToLong(r -> r.getTotalFileCount() != null ? r.getTotalFileCount() : 0L)
                .sum();

        return TreatmentPlanWorkflowResponse.builder()
                .totalPlans(totalPlans)
                .approved(approvedCount)
                .pendingApproval(pendingApprovalCount)
                .totalFilesCount(totalFilesCount)
                .plansList(responses)
                .build();
    }

    public static TreatmentPlanWorkflowResponse fromProjectionPage(Page<TreatmentPlanProfileSummary> planSummaryPage) {
        if (planSummaryPage == null || planSummaryPage.isEmpty()) {
            return TreatmentPlanWorkflowResponse.builder()
                    .totalPlans(0)
                    .approved(0)
                    .pendingApproval(0)
                    .plansList(Collections.emptyList())
                    .totalFilesCount(0L)
                    .paginationDetails(PaginationDetails.builder()
                            .pageNumber(0)
                            .pageSize(0)
                            .totalPatients(0)
                            .totalPages(0)
                            .hasNext(false)
                            .hasPrevious(false)
                            .build())
                    .build();
        }
        long totalFilesCount = planSummaryPage.stream()
                .filter(Objects::nonNull)
                .mapToLong(plan -> plan.getTotalFileCount() != null ? plan.getTotalFileCount() : 0L)
                .sum();

        List<TreatmentPlanProfileSummary> planSummaries = planSummaryPage.getContent();

        List<TreatmentPlanResponse> responses = planSummaries.stream()
                .filter(Objects::nonNull)
                .map(TreatmentPlanProfileSummary::toTreatmentPlanResponse)
                .collect(Collectors.toList());

        int approvedCount = (int) planSummaries.stream()
                .filter(Objects::nonNull)
                .filter(plan -> plan.getApproverStatus() == OrderTreatmentPlanStatus.APPROVED
                        || plan.getInitiatorStatus() == OrderTreatmentPlanStatus.APPROVED)
                .count();

        int pendingApprovalCount = (int) planSummaries.stream()
                .filter(Objects::nonNull)
                .filter(plan -> plan.getApproverStatus() == OrderTreatmentPlanStatus.PENDING_APPROVAL
                        || plan.getInitiatorStatus() == OrderTreatmentPlanStatus.PENDING_APPROVAL)
                .count();

        return TreatmentPlanWorkflowResponse.builder()
                .totalPlans((int) planSummaryPage.getTotalElements())
                .approved(approvedCount)
                .pendingApproval(pendingApprovalCount)
                .plansList(responses)
                .totalFilesCount(totalFilesCount)
                .paginationDetails(PaginationDetails.builder()
                        .pageNumber(planSummaryPage.getNumber())
                        .pageSize(planSummaryPage.getSize())
                        .totalPatients((int) planSummaryPage.getTotalElements())
                        .totalPages(planSummaryPage.getTotalPages())
                        .hasNext(planSummaryPage.hasNext())
                        .hasPrevious(planSummaryPage.hasPrevious())
                        .build())
                .build();
    }
}
