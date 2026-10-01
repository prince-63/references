package com.dentalstack.patient.feature.rewards.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.rewards.enums.TransactionType;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
        name = "coin_transaction",
        indexes = {
            @Index(name = "IX_transaction_patient_date", columnList = "patient_id, transactionDate"),
            @Index(name = "IX_transaction_profile", columnList = "user_profile_id"),
            @Index(name = "IX_transaction_type", columnList = "transactionType"),
            @Index(name = "IX_transaction_reference", columnList = "referenceType, referenceId")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoinTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @NotNull
    @Column(precision = 19, scale = 2)
    private BigDecimal amount;

    @NotNull
    @Column(precision = 19, scale = 2)
    private BigDecimal balanceBefore;

    @NotNull
    @Column(precision = 19, scale = 2)
    private BigDecimal balanceAfter;

    @NotNull
    private LocalDateTime transactionDate;

    @NotNull
    private String referenceType;

    private Long referenceId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Long performedByUserId;
}
