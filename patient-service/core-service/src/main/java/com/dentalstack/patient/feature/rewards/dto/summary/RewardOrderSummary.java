package com.dentalstack.patient.feature.rewards.dto.summary;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface RewardOrderSummary {
    Long getPatientId();

    String getFirstName();

    String getLastName();

    String getEmail();

    String getCustomerMappedId();

    String getUuid();

    String getProfilePictureUrl();

    Long getProfilePictureId();

    String getOrderNumber();

    String getProductName();

    BigDecimal getCoinValue();

    LocalDateTime getOrderDate();

    String getStatus();

    Long getRewardOrderId();
}
