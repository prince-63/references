package com.dentalstack.patient.feature.workflow.product.dto;

import lombok.Data;

@Data
public class CustomerAdminProductFilterRequest {
    private Long profileId;
    private Long categoryId;
    private String categoryName;
    private String productType;
    private String search;
    private Boolean isProductEnabled;
}
