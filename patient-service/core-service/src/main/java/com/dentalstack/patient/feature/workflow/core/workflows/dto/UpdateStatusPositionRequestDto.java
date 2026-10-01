package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusPositionRequestDto {
    @NotNull(message = "Position is required")
    private Integer position;
}
