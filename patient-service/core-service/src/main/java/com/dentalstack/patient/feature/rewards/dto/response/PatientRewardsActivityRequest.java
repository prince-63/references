package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.OrderStatus;
import com.dentalstack.patient.feature.rewards.enums.PromotionRedemptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientRewardsActivityRequest {

    private Long patientId;
    private OrderStatus orderStatus;
    private PromotionRedemptionStatus promotionRedemptionStatus;
}
