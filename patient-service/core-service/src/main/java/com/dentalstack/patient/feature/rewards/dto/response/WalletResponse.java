package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.*;
import java.math.BigDecimal;
import lombok.*;

@Data
@Builder
public class WalletResponse {
    private Long walletId;
    private BigDecimal totalCoins;
    private BigDecimal availableCoins;
    private BigDecimal lockedCoins;
    private BigDecimal lifetimeEarned;
    private BigDecimal lifetimeSpent;
    private Integer currentStreak;
    private Integer longestStreak;
}
