package com.dentalstack.patient.feature.rewards.dto.response;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponse {
    private Long itemId;
    private String productName;
    private String productImageUrl;
    private Integer quantity;
    private BigDecimal coinCostPerUnit;
    private BigDecimal totalCoins;
}
