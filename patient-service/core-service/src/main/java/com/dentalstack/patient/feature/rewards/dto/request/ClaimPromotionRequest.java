package com.dentalstack.patient.feature.rewards.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimPromotionRequest {
    private Long promotionId;

    private String referredPatientName;
    private String referredPatientPhone;
    private String referredPatientEmail;
    private Long patientId;

    private String notes;
}
