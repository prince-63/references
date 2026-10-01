package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateWorkflowRequestDto {
    @NotNull(message = "Profile ID is required")
    private Long profileId;

    @NotNull(message = "Organization ID is required")
    private Long orgId;

    @NotBlank(message = "Order type is required")
    private String orderType;

    @NotBlank(message = "Name is required")
    private String name;

    private String label;
    private Boolean systemDefined;
}
