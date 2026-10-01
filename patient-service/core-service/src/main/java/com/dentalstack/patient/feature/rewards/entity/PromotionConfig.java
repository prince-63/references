package com.dentalstack.patient.feature.rewards.entity;

import com.dentalstack.patient.feature.rewards.enums.PromotionStatus;
import com.dentalstack.patient.feature.rewards.enums.PromotionTargetAudience;
import com.dentalstack.patient.feature.rewards.enums.PromotionType;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
        name = "promotion_config",
        indexes = {
            @Index(name = "IX_promotion_profile_status", columnList = "user_profile_id, status"),
            @Index(name = "IX_promotion_dates", columnList = "startDate, endDate"),
            @Index(name = "IX_promotion_active", columnList = "status, isActive")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionConfig extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @NotNull
    private String promotionName;

    @Column(columnDefinition = "TEXT")
    private String promotionDescription;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PromotionType promotionType;

    @NotNull
    @Column(precision = 19, scale = 2)
    private BigDecimal value;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PromotionTargetAudience targetAudience;

    @Nullable
    private LocalDateTime startDate;

    @Nullable
    private LocalDateTime endDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PromotionStatus status;

    private Integer maxRedemptionsPerPatient;

    private Integer totalMaxRedemptions;

    @NotNull
    @Builder.Default
    private Integer currentRedemptions = 0;

    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    @NotNull
    @Builder.Default
    private Boolean isActive = true;

    private Long createdByUserId;
}
