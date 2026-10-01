package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RewardOrderResponse {
    private Long orderId;
    private String orderNumber;
    private BigDecimal totalCoins;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private ZonedDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime fulfilledAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private String adminNotes;
    private OrderMetadataResponse metadata;
}
