package com.dentalstack.doctor.entity.user;

import com.dentalstack.doctor.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "features_by_role",
        indexes = {
            @Index(
                    name = "UX_features_by_role_role_id_feature_id_permission_id",
                    unique = true,
                    columnList = "role_id, feature_id, permission_id")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllowedFeaturesByRole extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne
    @JoinColumn(name = "feature_id")
    private Feature feature;

    @ManyToOne
    @JoinColumn(name = "permission_id")
    private Permission permission;
}
