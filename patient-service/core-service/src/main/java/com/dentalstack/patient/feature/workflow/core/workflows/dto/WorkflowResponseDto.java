package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class WorkflowResponseDto {
    private Long id;
    private Long profileId;
    private Long orgId;
    private String orderType;
    private String name;
    private String label;
    private Boolean systemDefined;
    private Boolean archived;
    private WorkFlowManagementMetadata metadata;
    private List<StatusResponseDto> statuses;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer position;
}
