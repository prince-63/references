package com.dentalstack.patient.feature.order.dto;

import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrdersCountResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Count count;
    private TaskDetails task;
    private NeedsAttentionDetails needsAttention;
    private GettingStartedDetails gettingStarted;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Count implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        @Builder.Default
        private Long total = 0L;

        @Builder.Default
        private Long ordered = 0L;

        @Builder.Default
        private Long inProgress = 0L;

        @Builder.Default
        private Long inReview = 0L;

        @Builder.Default
        private Long onHold = 0L;

        @Builder.Default
        private Long replan = 0L;

        @Builder.Default
        private Long approved = 0L;

        @Builder.Default
        private Long completed = 0L;

        @Builder.Default
        private Long draft = 0L;

        @Builder.Default
        private Long cancelled = 0L;

        @Builder.Default
        private Long stlFileRequested = 0L;

        @Builder.Default
        private Long stlFileApproved = 0L;

        @Builder.Default
        private Long uniquePatientCount = 0L;

        @Builder.Default
        private Long notAddedDueByCount = 0L;

        @Builder.Default
        private Long totalPatientCount = 0L;

        @Builder.Default
        private Long manufacturingPendingCount = 0L;

        @Builder.Default
        private Long needMoreInfo = 0L;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class GettingStartedDetails implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        @Builder.Default
        private Long customerCount = 0L;

        @Builder.Default
        private Long userCount = 0L;

        private boolean isBrandAndCompanyDetailsAdded;

        @Builder.Default
        private Long invitedLabStaffCount = 0L;

        @Builder.Default
        private Long activeLabStaffCount = 0L;

        @Builder.Default
        private Long invitedCustomerCount = 0L;

        @Builder.Default
        private Long activeCustomerCount = 0L;

        @Builder.Default
        private Long userActionPending = 0L;

        @Builder.Default
        private Long customerActionPending = 0L;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class TaskDetails implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        @Builder.Default
        private Long newOrder = 0L;

        @Builder.Default
        private Long unassignedOrders = 0L;

        @Builder.Default
        private Long urgentOrders = 0L;

        @Builder.Default
        private Long inProgress = 0L;

        @Builder.Default
        private Long reviewAssignedOrdersToMe = 0L;

        @Builder.Default
        private Long totalPending = 0L;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class NeedsAttentionDetails implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        @Builder.Default
        private Long inReplan = 0L;

        @Builder.Default
        private Long stlFileRequested = 0L;

        @Builder.Default
        private Long dueToday = 0L;

        @Builder.Default
        private Long overdue = 0L;

        @Builder.Default
        private Long notAddedDueBy = 0L;
    }
}
