package com.dentalstack.patient.feature.workflow.card_display.dto;

import com.dentalstack.patient.feature.workflow.card_display.entity.CardDisplayField;
import com.dentalstack.patient.feature.workflow.card_display.enums.DisplayTypeEnum;
import lombok.Data;

@Data
public class CardDisplayFieldResponseDto {
    private Long id;
    private Long configId;
    private String fieldKey;
    private String label;
    private Boolean enabled;
    private Integer position;
    private DisplayTypeEnum displayType;
    private String sampleValue;
    private Boolean showInPreview;

    public static CardDisplayFieldResponseDto from(CardDisplayField cardDisplayField) {
        CardDisplayFieldResponseDto dto = new CardDisplayFieldResponseDto();
        dto.setId(cardDisplayField.getId());
        dto.setConfigId(cardDisplayField.getConfig().getId());
        dto.setFieldKey(cardDisplayField.getFieldKey());
        dto.setLabel(cardDisplayField.getLabel());
        dto.setEnabled(cardDisplayField.getEnabled());
        dto.setPosition(cardDisplayField.getPosition());
        dto.setDisplayType(cardDisplayField.getDisplayType());
        dto.setSampleValue(cardDisplayField.getSampleValue());
        dto.setShowInPreview(cardDisplayField.getShowInPreview());
        return dto;
    }
}
