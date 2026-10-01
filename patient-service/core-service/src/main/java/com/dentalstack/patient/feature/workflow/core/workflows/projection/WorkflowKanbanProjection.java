package com.dentalstack.patient.feature.workflow.core.workflows.projection;

public interface WorkflowKanbanProjection {
    String getWorkflowName();

    String getLabelName();

    Long getCount();

    String getWorkflowLabelName();

    String getWorkflowStatusName();
}
