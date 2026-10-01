package com.dentalstack.doctor.entity.rbac;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.enums.rbac.PermissionType;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Entity
@Table(
        name = "sub_role_sub_module_permission",
        uniqueConstraints = @UniqueConstraint(columnNames = {"sub_role_id", "sub_module_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubRoleSubModulePermission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_role_id", nullable = false)
    private SubRole subRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_module_id", nullable = false)
    private SubModule subModule;

    @ElementCollection(targetClass = PermissionType.class)
    @CollectionTable(
            name = "sub_role_sub_module_permission_types",
            joinColumns = @JoinColumn(name = "sub_role_sub_module_permission_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "permission_type")
    @Builder.Default
    private Set<PermissionType> permissions = new HashSet<>();
}
