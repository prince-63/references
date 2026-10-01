package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.PromotionStatus;
import com.dentalstack.patient.feature.rewards.enums.PromotionTargetAudience;
import com.dentalstack.patient.feature.rewards.enums.PromotionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PromotionConfigResponse {
    private Long id;
    private String promotionName;
    private String promotionDescription;
    private PromotionType promotionType;
    private BigDecimal value;
    private PromotionTargetAudience targetAudience;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private PromotionStatus status;
    private Integer maxRedemptionsPerPatient;
    private Integer totalMaxRedemptions;
    private Integer currentRedemptions;
    private String termsAndConditions;
    private ZonedDateTime createdAt;
}
