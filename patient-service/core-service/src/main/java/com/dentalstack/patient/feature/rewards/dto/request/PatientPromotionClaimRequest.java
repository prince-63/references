package com.dentalstack.patient.feature.rewards.dto.request;

import com.dentalstack.patient.feature.rewards.enums.PromotionRedemptionStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientPromotionClaimRequest {
    private String search;
    private Long profileId;
    private Integer page;
    private Integer size;
    private PromotionRedemptionStatus status;
}
