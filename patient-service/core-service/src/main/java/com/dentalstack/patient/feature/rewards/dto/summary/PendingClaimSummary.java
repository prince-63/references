package com.dentalstack.patient.feature.rewards.dto.summary;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface PendingClaimSummary {
    Long getRedemptionId();

    Long getPromotionId();

    String getPromotionName();

    String getPromotionDescription();

    String getPromotionType();

    BigDecimal getCoinsReceived();

    String getStatus();

    LocalDateTime getRedeemedAt();

    Long getPatientId();

    String getPatientFirstName();

    String getPatientLastName();

    String getPatientEmail();

    String getPatientPhone();

    String getPatientProfilePictureUrl();

    String getReferredPatientName();

    String getReferredPatientPhone();

    String getReferredPatientEmail();

    Long getReferredPatientId();

    String getVerificationNotes();
}
