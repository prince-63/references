package com.dentalstack.patient.feature.rewards.entity;

import com.dentalstack.patient.feature.rewards.enums.ProductCategory;
import com.dentalstack.patient.feature.rewards.enums.ProductStatus;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.*;

@Entity
@Table(
        name = "reward_product_config",
        indexes = {
            @Index(name = "IX_product_profile_status", columnList = "user_profile_id, status"),
            @Index(name = "IX_product_category", columnList = "category, isActive"),
            @Index(name = "IX_product_featured", columnList = "isFeatured, displayOrder")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardProductConfig extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @NotNull
    private String productName;

    @Column(columnDefinition = "TEXT")
    private String productDescription;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProductCategory category;

    @NotNull
    @Column(precision = 19, scale = 2)
    private BigDecimal coinCost;

    @Column(precision = 19, scale = 2)
    private BigDecimal monetaryValue;

    @NotNull
    @Builder.Default
    private Integer inventoryCount = 0;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    @Builder.Default
    private Integer displayOrder = 0;

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Integer lowStockThreshold = 10;

    @NotNull
    @Builder.Default
    private Boolean isActive = true;
}
