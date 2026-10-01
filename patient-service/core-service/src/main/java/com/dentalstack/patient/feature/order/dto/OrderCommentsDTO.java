package com.dentalstack.patient.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderCommentsDTO {
    private String orderId;
    private Long doctorId;
    private Long profileId;
    private String notes;
}
