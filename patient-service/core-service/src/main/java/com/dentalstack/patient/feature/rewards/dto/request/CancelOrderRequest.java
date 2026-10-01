package com.dentalstack.patient.feature.rewards.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelOrderRequest {
    @NotBlank
    private String reason;

    private Long patientId;
    private Long rewardOrderId;
}
