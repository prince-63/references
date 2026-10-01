package com.dentalstack.patient.feature.rewards.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectOrderRequest {
    @NotBlank
    private String reason;

    private Long profileId;
    private Long rewardOrderId;
}
