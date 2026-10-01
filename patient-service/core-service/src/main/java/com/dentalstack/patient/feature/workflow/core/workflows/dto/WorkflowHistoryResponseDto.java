package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class WorkflowHistoryResponseDto {
    private Long id;
    private Long profileId;
    private Long workflowId;
    private String changeType;
    private WorkFlowManagementMetadata diff;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
