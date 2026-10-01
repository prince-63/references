package com.dentalstack.patient.feature.rewards.dto.response;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PromotionClaimResponse {
    private Long redemptionId;
    private String promotionName;
    private BigDecimal coinsReceived;
    private String message;
    private WalletResponse updatedWallet;
}
