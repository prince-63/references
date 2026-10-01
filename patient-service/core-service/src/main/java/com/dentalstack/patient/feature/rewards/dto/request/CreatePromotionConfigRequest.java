package com.dentalstack.patient.feature.rewards.dto.request;

import com.dentalstack.patient.feature.rewards.enums.PromotionTargetAudience;
import com.dentalstack.patient.feature.rewards.enums.PromotionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreatePromotionConfigRequest {
    @NotBlank
    private String promotionName;

    @NotNull
    private PromotionType promotionType;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal value;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

    @NotNull
    private PromotionTargetAudience targetAudience;

    private Long profileId;
}
