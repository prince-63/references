package com.dentalstack.patient.feature.subscription.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subscription_user_mapping")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionUserMapping extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "subscription_plan_id")
    private SubscriptionPlan subscriptionPlan;

    private Long doctorId;
    private Long userProfileId;
    private Boolean isAdmin;
}
