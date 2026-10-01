package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PurchaseOrderDetails {
    private String orderId;
    private OrderStatus status;
    private LocalDate dueBy;
    private Boolean isUrgent;

    public static PurchaseOrderDetails from(Order order) {
        return PurchaseOrderDetails.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .dueBy(order.getDueBy())
                .isUrgent(order.getIsUrgent())
                .build();
    }
}
