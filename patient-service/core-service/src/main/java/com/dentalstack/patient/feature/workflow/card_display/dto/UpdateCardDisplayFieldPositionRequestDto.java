package com.dentalstack.patient.feature.workflow.card_display.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCardDisplayFieldPositionRequestDto {
    @NotNull(message = "Position is required")
    private Integer position;
}
