package com.dentalstack.patient.feature.rewards.dto.request;

import com.dentalstack.patient.feature.rewards.enums.ProductCategory;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateProductConfigRequest {
    @NotBlank
    private String productName;

    private String productDescription;

    @NotNull
    private ProductCategory category;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal coinCost;

    private BigDecimal monetaryValue;

    @Min(0)
    private Integer inventoryCount;

    private String termsAndConditions;
    private Integer displayOrder;
    private Boolean isFeatured;
    private Integer lowStockThreshold;
    private Long profileId;
}
