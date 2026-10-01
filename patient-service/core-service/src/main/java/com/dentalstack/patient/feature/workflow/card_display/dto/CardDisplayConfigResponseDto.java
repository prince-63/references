package com.dentalstack.patient.feature.workflow.card_display.dto;

import java.util.List;
import lombok.Data;

@Data
public class CardDisplayConfigResponseDto {
    private Long id;
    private Long profileId;
    private Long orgId;
    private Boolean active;
    private List<CardDisplayFieldResponseDto> cardDisplayFields;
}
