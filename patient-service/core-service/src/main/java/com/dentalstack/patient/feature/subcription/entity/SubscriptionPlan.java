package com.dentalstack.patient.feature.subcription.entity;

import com.dentalstack.patient.feature.storage.migration.enums.DriveMigrationStatus;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionPlanDTO.PlanMetadata;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
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

    private Boolean requestedForDeactivation;
    private Boolean isWhatsAppMessagingEnabled;
    private Boolean isDemoCompleted;

    @Builder.Default
    private Boolean isGDrivePlatformEnabled = false;

    @Builder.Default
    @Enumerated(value = EnumType.STRING)
    private DriveMigrationStatus gDriveMigrationStatus = DriveMigrationStatus.PENDING;

    @Builder.Default
    private Boolean isGDrivePlatformAuthenticated = false;
}
