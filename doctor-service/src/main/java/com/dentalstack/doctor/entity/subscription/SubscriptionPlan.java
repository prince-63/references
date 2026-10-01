package com.dentalstack.doctor.entity.subscription;

import com.dentalstack.doctor.dto.subscription.Subscription;
import com.dentalstack.doctor.entity.BaseEntity;
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

    private int totalPatients;
    private String brand;

    private int totalStorageGb;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Subscription.PlanMetadata planMetadata;

    private Boolean isGDrivePlatformEnabled;
}
