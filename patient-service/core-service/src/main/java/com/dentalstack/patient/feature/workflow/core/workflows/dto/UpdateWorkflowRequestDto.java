package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateWorkflowRequestDto {
    @NotBlank(message = "Name is required")
    private String name;

    private String label;
}
