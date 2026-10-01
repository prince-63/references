package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowKanbanSummaryResponse {
    private List<WorkflowKanbanDetailsResponse> details;
}
