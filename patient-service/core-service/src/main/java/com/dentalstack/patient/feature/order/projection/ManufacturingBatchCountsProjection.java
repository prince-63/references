package com.dentalstack.patient.feature.order.projection;

public interface ManufacturingBatchCountsProjection {
    Integer getPendingCount();

    Integer getManufacturingPendingCount();

    Integer getManufacturingStartedCount();

    Integer getInProgressCount();

    Integer getCompletedCount();

    Integer getShippedCount();

    Integer getDeliveredCount();

    Integer getCancelledCount();

    Integer getTotalCount();
}
