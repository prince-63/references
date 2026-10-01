package com.dentalstack.patient.feature.workflow.product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateServiceProductRequestDto {
    private String productType;

    @NotBlank(message = "Product name is required")
    private String productName;

    private String category;
    private String productDescription;
    private String productImage;
    private String productTag;
}
