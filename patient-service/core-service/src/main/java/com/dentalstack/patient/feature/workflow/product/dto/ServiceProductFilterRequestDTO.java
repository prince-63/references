package com.dentalstack.patient.feature.workflow.product.dto;

import java.util.List;
import lombok.Data;

@Data
public class ServiceProductFilterRequestDTO {
    private Long ownerProfileId;
    private List<Long> vendorProfileIds;
    private Long categoryId;
    private String categoryName;
    private String productType;
    private String search;
    private Boolean isProductEnabled;
}
