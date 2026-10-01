package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.PromotionRedemptionStatus;
import com.dentalstack.patient.feature.rewards.enums.PromotionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingPromotionClaimResponse {
    private Long redemptionId;
    private Long promotionId;
    private String promotionName;
    private String promotionDescription;
    private PromotionType promotionType;
    private BigDecimal coinsReceived;
    private PromotionRedemptionStatus status;
    private LocalDateTime redeemedAt;

    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    private String referredPatientName;
    private String referredPatientPhone;
    private String referredPatientEmail;
    private Long referredPatientId;

    private String verificationNotes;
    private String rejectionReason;
}
