package com.dentalstack.patient.feature.workflow.product.dto;

import com.dentalstack.patient.feature.workflow.product.entity.ProductCategory;
import com.dentalstack.patient.feature.workflow.product.enums.CategoryType;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductCategoryResponse {

    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;

    private CategoryType categoryType;

    private String description;

    private Long profileId;

    private Boolean isDefault;

    public static ProductCategoryResponse from(ProductCategory request) {
        return ProductCategoryResponse.builder()
                .id(request.getId())
                .name(request.getName())
                .description(request.getDescription())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : Boolean.FALSE)
                .categoryType(request.getCategoryType())
                .build();
    }
}
