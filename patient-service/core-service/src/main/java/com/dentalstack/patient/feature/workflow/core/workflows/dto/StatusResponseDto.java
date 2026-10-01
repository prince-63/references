package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.InternalWorkflowEnum;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.MapToEnum;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class StatusResponseDto {
    private Long id;
    private Long workflowId;
    private String name;
    private String labelName;
    private String description;
    private InternalWorkflowEnum internalName;
    private MapToEnum mapsTo;
    private Boolean custom;
    private String color;
    private Boolean nonDeletable;
    private Integer position;
    private WorkFlowManagementMetadata metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
