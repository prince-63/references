package com.dentalstack.patient.feature.subscription.entity;

import com.dentalstack.patient.feature.subscription.dto.SubscriptionPlanDTO.PlanMetadata;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "subscription")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlan extends BaseEntity {

    private Integer totalPatients;
    private Double totalStorageGb;
    private Boolean hasPlanStartedConsent;
    private Integer totalUsers;
    private Integer totalOrders;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private PlanMetadata planMetadata;

    private Boolean isWhatsAppMessagingEnabled;
}
