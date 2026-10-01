package com.dentalstack.patient.feature.workflow.product.dto;

import com.dentalstack.patient.feature.workflow.product.enums.CategoryType;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategoryGetRequest {
    private Long profileId;

    @Nullable
    private CategoryType categoryType;
}
