package com.dentalstack.patient.feature.workflow.core.workflows.service;

import com.dentalstack.patient.feature.workflow.core.workflows.dto.WorkflowKanbanSummaryResponse;

public interface KanbanService {
    WorkflowKanbanSummaryResponse getWorkflowKanbanSummaryByProfile(Long profileId);
}
