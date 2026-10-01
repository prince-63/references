package com.dentalstack.patient.feature.workflow.card_display.dto;

import lombok.Data;

@Data
public class UpdateCardDisplayConfigRequestDto {
    private String name;
    private Boolean active;
}
