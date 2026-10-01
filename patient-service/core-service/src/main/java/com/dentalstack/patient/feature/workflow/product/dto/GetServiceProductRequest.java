package com.dentalstack.patient.feature.workflow.product.dto;

import com.dentalstack.patient.feature.workflow.product.enums.CategoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetServiceProductRequest {
    private Long profileId;
    private Long categoryId;
    private CategoryType categoryType;
    private CategoryType productType;
    private String searchText;
}
