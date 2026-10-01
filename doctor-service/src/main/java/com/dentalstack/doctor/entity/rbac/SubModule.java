package com.dentalstack.doctor.entity.rbac;

import com.dentalstack.doctor.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "sub_module")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubModule extends BaseEntity {
    @NotNull
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id")
    private Module module;

    //    @ElementCollection(targetClass = PermissionType.class)
    //    @CollectionTable(name = "sub_module_permissions", joinColumns = @JoinColumn(name = "sub_module_id"))
    //    @Enumerated(EnumType.STRING)
    //    @Column(name = "permission_type")
    //    @Builder.Default
    //    private Set<PermissionType> permissions = new HashSet<>();
}
