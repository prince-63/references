package com.dentalstack.patient.feature.rewards.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
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
public class UpdateProductConfigRequest {
    private String productName;
    private String productDescription;
    private BigDecimal coinCost;
    private BigDecimal monetaryValue;
    private String termsAndConditions;
    private Integer displayOrder;
    private Boolean isFeatured;
    private Integer lowStockThreshold;
    private Long profileId;
    private Long productId;
}
