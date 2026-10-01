package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.InternalWorkflowEnum;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.MapToEnum;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateStatusRequestDto {
    @NotBlank(message = "Status name is required")
    private String name;

    private String labelName;
    private String description;
    private InternalWorkflowEnum internalName;
    private MapToEnum mapsTo;
    private String color;
    private Boolean custom;
    private Boolean nonDeletable;
    private Integer position;
}
