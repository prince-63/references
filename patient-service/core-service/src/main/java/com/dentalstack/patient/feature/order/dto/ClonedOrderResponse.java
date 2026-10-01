package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClonedOrderResponse {
    private String purchaseOrderId;

    public static ClonedOrderResponse from(Order clonedOrder) {
        return ClonedOrderResponse.builder()
                .purchaseOrderId(clonedOrder.getId())
                .build();
    }
}
