package com.dentalstack.patient.feature.workflow.product.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "last_used_service_products")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class LastUsedServiceProduct extends BaseEntity {

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "user_profile_id", nullable = false)
    private Long userProfileId;
}
