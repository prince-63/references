package com.dentalstack.patient.feature.treatment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AttachShippingToTreatment {
    private Long treatmentPlanId;
    private Long shippingId;
}
