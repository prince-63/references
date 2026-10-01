package com.dentalstack.patient.feature.rewards.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyPromotionClaimRequest {
    private Long redemptionId;
    private Long userProfileId;
    private Boolean approved;
    private String notes;
    private Long referredPatientId;
}
