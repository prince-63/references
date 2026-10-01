package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.ProductCategory;
import com.dentalstack.patient.feature.rewards.enums.ProductStatus;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientProductResponse {
    private Long productId;
    private String productName;
    private String productDescription;
    private ProductCategory category;
    private BigDecimal coinCost;
    private BigDecimal monetaryValue;
    private ProductStatus status;
    private String imageUrl;
    private String termsAndConditions;
    private Boolean canAfford;
}
