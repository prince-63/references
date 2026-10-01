package com.dentalstack.patient.feature.rewards.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class UpdatePromotionConfigRequest {
    private String promotionName;
    private BigDecimal value;
    private Long profileId;
    private Long promotionId;
    private LocalDateTime endDate;
}
