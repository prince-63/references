package com.dentalstack.patient.feature.rewards.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.*;

@Entity
@Table(
        name = "user_wallet",
        indexes = {
            @Index(name = "IX_wallet_patient", columnList = "patient_id", unique = true),
            @Index(name = "IX_wallet_active", columnList = "isActive")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserWallet extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotNull
    @Column(precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal totalCoins = BigDecimal.ZERO;

    @NotNull
    @Column(precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal availableCoins = BigDecimal.ZERO;

    @NotNull
    @Column(precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal lockedCoins = BigDecimal.ZERO;

    @NotNull
    @Column(precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal lifetimeEarned = BigDecimal.ZERO;

    @NotNull
    @Column(precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal lifetimeSpent = BigDecimal.ZERO;

    @NotNull
    @Builder.Default
    private Integer currentStreak = 0;

    @NotNull
    @Builder.Default
    private Integer longestStreak = 0;

    @NotNull
    @Builder.Default
    private Boolean isActive = true;
}
