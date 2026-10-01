package com.dentalstack.patient.feature.order.projection;

public interface OrderCountSummary {

    Long getTotalCount();

    Long getOrderedCount();

    Long getInProgressCount();

    Long getInReviewCount();

    Long getOnHoldCount();

    Long getRePlanCount();

    Long getApprovedCount();

    Long getCompletedCount();

    Long getDraftCount();

    Long getCancelledCount();

    Long getStlFilesRequestedCount();

    Long getStlFilesUploadedCount();

    Long getNewOrdersCount();

    Long getUnassignedOrdersCount();

    Long getUrgentOrdersCount();

    Long getAssignedToMeCount();

    Long getDueTodayCount();

    Long getOverdueCount();

    Long getSentCount();

    Long getReceivedCount();

    Long getThisMonthSentCount();

    Long getLastMonthSentCount();

    Long getThisMonthReceivedCount();

    Long getLastMonthReceivedCount();

    Long getUniquePatientCount();

    Long getNotAddedDueByCount();

    Long getTotalPatientCount();

    Long getManufacturingPendingCount();

    Long getNeedMoreInfoCount();

    String getLatestOrderStatus();

    Long getArchivedCount();

    Long getInReviewTreatmentCount();

    String getLatestOrderId();

    static OrderCountSummary createEmptyCountSummary() {
        return new OrderCountSummary() {
            @Override
            public Long getTotalCount() {
                return 0L;
            }

            @Override
            public Long getOrderedCount() {
                return 0L;
            }

            @Override
            public Long getInProgressCount() {
                return 0L;
            }

            @Override
            public Long getInReviewCount() {
                return 0L;
            }

            @Override
            public Long getOnHoldCount() {
                return 0L;
            }

            @Override
            public Long getRePlanCount() {
                return 0L;
            }

            @Override
            public Long getApprovedCount() {
                return 0L;
            }

            @Override
            public Long getCompletedCount() {
                return 0L;
            }

            @Override
            public Long getDraftCount() {
                return 0L;
            }

            @Override
            public Long getCancelledCount() {
                return 0L;
            }

            @Override
            public Long getStlFilesRequestedCount() {
                return 0L;
            }

            @Override
            public Long getStlFilesUploadedCount() {
                return 0L;
            }

            @Override
            public Long getNewOrdersCount() {
                return 0L;
            }

            @Override
            public Long getUnassignedOrdersCount() {
                return 0L;
            }

            @Override
            public Long getUrgentOrdersCount() {
                return 0L;
            }

            @Override
            public Long getAssignedToMeCount() {
                return 0L;
            }

            @Override
            public Long getDueTodayCount() {
                return 0L;
            }

            @Override
            public Long getOverdueCount() {
                return 0L;
            }

            @Override
            public Long getSentCount() {
                return 0L;
            }

            @Override
            public Long getReceivedCount() {
                return 0L;
            }

            @Override
            public Long getThisMonthSentCount() {
                return 0L;
            }

            @Override
            public Long getLastMonthSentCount() {
                return 0L;
            }

            @Override
            public Long getThisMonthReceivedCount() {
                return 0L;
            }

            @Override
            public Long getLastMonthReceivedCount() {
                return 0L;
            }

            @Override
            public Long getUniquePatientCount() {
                return 0L;
            }

            @Override
            public Long getNotAddedDueByCount() {
                return 0L;
            }

            @Override
            public Long getTotalPatientCount() {
                return 0L;
            }

            @Override
            public Long getManufacturingPendingCount() {
                return 0L;
            }

            @Override
            public Long getNeedMoreInfoCount() {
                return 0L;
            }

            @Override
            public Long getArchivedCount() {
                return 0L;
            }

            @Override
            public String getLatestOrderStatus() {
                return "N/A";
            }

            @Override
            public Long getInReviewTreatmentCount() {
                return 0L;
            }

            @Override
            public String getLatestOrderId() {
                return "N/A";
            }
        };
    }
}
