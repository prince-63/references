package com.dentalstack.patient.feature.workflow.product.dto;

import com.dentalstack.patient.feature.workflow.product.entity.ProductCategory;
import com.dentalstack.patient.feature.workflow.product.enums.CategoryType;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategoryV2Response {
    private Long id;
    private String name;
    private CategoryType categoryType;
    private String description;
    private Boolean isDefault;

    public static ProductCategoryV2Response from(ProductCategory category) {
        return Optional.ofNullable(category)
                .map(c -> ProductCategoryV2Response.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .categoryType(c.getCategoryType())
                        .description(c.getDescription())
                        .isDefault(c.getIsDefault())
                        .build())
                .orElse(null);
    }
}
