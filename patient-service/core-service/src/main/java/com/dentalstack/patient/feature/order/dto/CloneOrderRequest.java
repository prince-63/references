package com.dentalstack.patient.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CloneOrderRequest {

    private String customerOrderId;
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private Long serviceProductId;
}
