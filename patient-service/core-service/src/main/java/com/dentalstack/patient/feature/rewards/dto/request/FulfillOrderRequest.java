package com.dentalstack.patient.feature.rewards.dto.request;

import lombok.Data;

@Data
public class FulfillOrderRequest {
    private String trackingNumber;
    private String courierService;
    private String notes;
    private Long profileId;
    private Long rewardOrderId;
}
