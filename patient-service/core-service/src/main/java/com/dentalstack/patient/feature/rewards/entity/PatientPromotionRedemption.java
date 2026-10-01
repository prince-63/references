package com.dentalstack.patient.feature.rewards.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.rewards.enums.PromotionRedemptionStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
        name = "patient_promotion_redemption",
        indexes = {
            @Index(name = "IX_redemption_patient_promo", columnList = "patient_id, promotion_config_id"),
            @Index(name = "IX_redemption_status", columnList = "status"),
            @Index(name = "IX_redemption_patient_status", columnList = "patient_id, status")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientPromotionRedemption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_config_id", nullable = false)
    private PromotionConfig promotionConfig;

    @NotNull
    private LocalDateTime redeemedAt;

    @NotNull
    @Column(precision = 19, scale = 2)
    private BigDecimal coinsReceived;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PromotionRedemptionStatus status = PromotionRedemptionStatus.CLAIMED;

    private LocalDateTime appliedAt;

    private LocalDateTime expiredAt;

    private LocalDateTime verifiedAt;

    private Long verifiedByUserId;

    @Column(columnDefinition = "TEXT")
    private String verificationNotes;

    private LocalDateTime rejectedAt;

    private Long rejectedByUserId;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(length = 500)
    private String referredPatientName;

    private Long referredPatientId;

    @Column(length = 100)
    private String referredPatientPhone;

    @Column(length = 255)
    private String referredPatientEmail;
}
