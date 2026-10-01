package com.dentalstack.patient.feature.workflow.core.workflows.projection;

public interface OngoingTaskCountProjection {
    Long getManufacturingBatchId();

    String getLabelName();

    Long getCount();
}
