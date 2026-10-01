package com.dentalstack.patient.feature.workflow.card_display.dto;

import com.dentalstack.patient.feature.workflow.card_display.enums.DisplayTypeEnum;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCardDisplayFieldRequestDto {
    @NotBlank(message = "Field key is required")
    private String fieldKey;

    @NotBlank(message = "Label is required")
    private String label;

    private Boolean enabled;
    private Integer position;
    private DisplayTypeEnum displayType;
    private String sampleValue;
    private Boolean showInPreview;

    private String productType;
    private String productName;
    private String category;
    private String productDescription;
    private String productImage;
    private String productTag;
}
