package com.dentalstack.patient.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateOrderResponse {
    private String orderId;
    private Long shippingId;

    public static CreateOrderResponse from(String orderId, Long shippingId) {
        return CreateOrderResponse.builder()
                .orderId(orderId)
                .shippingId(shippingId)
                .build();
    }
}
