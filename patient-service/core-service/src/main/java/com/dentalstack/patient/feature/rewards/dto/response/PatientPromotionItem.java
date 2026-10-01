package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.PromotionType;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientPromotionItem {
    private Long promotionId;
    private String promotionName;
    private String promotionDescription;
    private PromotionType promotionType;
    private BigDecimal value;
    private Boolean canClaim;
    private String cannotClaimReason;
}
