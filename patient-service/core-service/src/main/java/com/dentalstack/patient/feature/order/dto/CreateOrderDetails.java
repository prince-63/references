package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.enums.OrderType;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateOrderDetails {
    private Long labId;
    private String labName;
    private OrderType orderType;
    private LocalDate dueBy;
    private Boolean isUrgent;
    private ZonedDateTime createdAt;
    private OrderOwnerDetails targetUserDetails;

    public static CreateOrderDetails from(Order order) {

        return CreateOrderDetails.builder()
                .labId(order.getLabId())
                .labName(order.getTargetProfileName())
                .dueBy(order.getDueBy())
                .isUrgent(order.getIsUrgent())
                .orderType(order.getOrderType())
                .createdAt(order.getCreatedAt())
                .targetUserDetails(order.getTargetProfile() == null ? null : OrderOwnerDetails.from(order))
                .build();
    }
}
