package com.dentalstack.patient.feature.workflow.product.entity;

import com.dentalstack.patient.feature.doctor.entity.Organization;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "disabled_customer_product_mappings",
        uniqueConstraints =
                @UniqueConstraint(
                        columnNames = {"owner_profile_id", "disabled_for_profile_id", "product_id", "organization_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisabledCustomerProductMapping extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_profile_id", nullable = false)
    private UserProfile ownerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disabled_for_profile_id", nullable = false)
    private UserProfile disabledForProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ServiceProduct serviceProduct;
}
