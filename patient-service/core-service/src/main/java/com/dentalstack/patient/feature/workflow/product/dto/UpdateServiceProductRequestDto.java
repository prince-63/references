package com.dentalstack.patient.feature.workflow.product.dto;

import lombok.Data;

@Data
public class UpdateServiceProductRequestDto {
    private String productName;
    private String category;
    private String productDescription;
    private String productImage;
    private String productTag;
}
