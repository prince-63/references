package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateWorkflowHistoryRequestDto {
    @NotNull(message = "Profile ID is required")
    private Long profileId;

    @NotBlank(message = "Change type is required")
    private String changeType;

    private Long performedBy;
    private String description;
}
