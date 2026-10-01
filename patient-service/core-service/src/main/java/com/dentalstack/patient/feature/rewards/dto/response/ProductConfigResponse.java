package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.ProductCategory;
import com.dentalstack.patient.feature.rewards.enums.ProductStatus;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductConfigResponse {
    private Long id;
    private String productName;
    private String productDescription;
    private ProductCategory category;
    private BigDecimal coinCost;
    private BigDecimal monetaryValue;
    private Integer inventoryCount;
    private ProductStatus status;
    private String imageUrl;
    private String termsAndConditions;
    private Integer displayOrder;
    private Boolean isFeatured;
    private Integer lowStockThreshold;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
