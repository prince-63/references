package com.dentalstack.patient.feature.workflow.card_display.dto;

import com.dentalstack.patient.feature.workflow.card_display.enums.DisplayTypeEnum;
import lombok.Data;

@Data
public class UpdateCardDisplayFieldRequestDto {
    private String fieldKey;
    private String label;
    private Boolean enabled;
    private Integer position;
    private DisplayTypeEnum displayType;
    private String sampleValue;
    private Boolean showInPreview;
}
