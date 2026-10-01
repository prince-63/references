package com.dentalstack.patient.feature.rewards.dto.request;

import lombok.Data;

@Data
public class ApproveOrderRequest {
    private String notes;
    private Long profileId;
    private Long rewardOrderId;
}
