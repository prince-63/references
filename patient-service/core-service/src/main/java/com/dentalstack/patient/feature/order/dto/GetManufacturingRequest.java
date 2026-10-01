package com.dentalstack.patient.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetManufacturingRequest {
    private Long patientId;
    private Long treatmentPlanId;
    private String orderId;
    private Long profileId;
}
