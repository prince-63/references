package com.dentalstack.patient.feature.rewards.dto.summary;

import java.math.BigDecimal;

public interface RewardDashboardStats {
    Long getActivePatient();

    BigDecimal getCoinRedeemed();

    BigDecimal getCoinDistributed();
}
