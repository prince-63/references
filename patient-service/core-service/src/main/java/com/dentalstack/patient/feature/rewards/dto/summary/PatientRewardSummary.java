package com.dentalstack.patient.feature.rewards.dto.summary;

import java.math.BigDecimal;

public interface PatientRewardSummary {
    Long getPatientId();

    String getFirstName();

    String getLastName();

    String getEmail();

    String getCustomerMappedId();

    String getUuid();

    String getProfilePictureUrl();

    Long getProfilePictureId();

    BigDecimal getCoinsEarned();

    BigDecimal getCoinsUsed();
}
