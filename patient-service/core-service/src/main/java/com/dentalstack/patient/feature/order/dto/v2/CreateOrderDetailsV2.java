package com.dentalstack.patient.feature.order.dto.v2;

import com.dentalstack.patient.feature.order.enums.OrderType;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateOrderDetailsV2 {
    private Long labId;
    private String labName;
    private OrderType orderType;
    private LocalDate dueBy;
    private Boolean isUrgent;
}
