package com.dentalstack.patient.feature.workflow.product.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ServiceProductRequest {

    private String productType;

    @NotBlank(message = "Product name is required")
    private String productName;

    private String productDescription;

    private String productImage;

    @NotNull(message = "Product category ID is required")
    private Long productCategoryId;

    private Long profileId;

    private Boolean isProductEnabled;

    private Boolean isDefault;
}
