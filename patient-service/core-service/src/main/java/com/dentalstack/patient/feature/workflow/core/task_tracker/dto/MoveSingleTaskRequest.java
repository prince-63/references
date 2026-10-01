package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveSingleTaskRequest {
    private Long profileId;
    private String workflowName;
    private String workflowStausName;
    private Long patientId;
    private String currentWorkflowName;
}
