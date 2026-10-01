package com.dentalstack.patient.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderRequest {
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private String orderId;
    private Boolean retrieveTreatmentPlan;
}
