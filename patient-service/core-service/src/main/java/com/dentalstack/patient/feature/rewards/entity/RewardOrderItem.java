package com.dentalstack.patient.feature.rewards.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.*;

@Entity
@Table(
        name = "reward_order_item",
        indexes = {
            @Index(name = "IX_order_item_order", columnList = "reward_order_id"),
            @Index(name = "IX_order_item_product", columnList = "reward_product_config_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardOrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_order_id", nullable = false)
    private RewardOrder rewardOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_product_config_id", nullable = false)
    private RewardProductConfig rewardProductConfig;

    @NotNull
    @Builder.Default
    private Integer quantity = 1;

    @NotNull
    @Column(precision = 19, scale = 2)
    private BigDecimal coinCostPerUnit;

    @NotNull
    @Column(precision = 19, scale = 2)
    private BigDecimal totalCoins;

    private String productSnapshotName;

    @Column(columnDefinition = "TEXT")
    private String productSnapshotDescription;

    @Column(columnDefinition = "TEXT")
    private String productSnapshotImageUrl;
}
