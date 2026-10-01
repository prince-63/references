package com.dentalstack.patient.feature.rewards.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ManualCoinAdjustmentRequest {
    @NotNull
    private Long patientId;

    @NotNull
    private BigDecimal amount;

    @NotBlank
    private String reason;

    private String notes;
    private Long profileId;
}
