package com.dentalstack.patient.feature.workflow.core.workflows.projection;

public interface LabelCountProjection {
    String getLabelName();

    Long getCount();

    Long getTotalCount();
}
