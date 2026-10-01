package com.dentalstack.patient.feature.rbac.entity;

import com.dentalstack.patient.feature.rbac.enums.SubRoleTag;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;
import javax.annotation.Nullable;
import lombok.*;

@Entity
@Table(name = "sub_role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubRole extends BaseEntity {
    @NotNull
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private SubRoleTag subRoleTag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private Plan plan;

    @OneToMany(mappedBy = "subRole", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<SubRoleModulePermission> modulePermissions = new HashSet<>();

    @OneToMany(mappedBy = "subRole", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<SubRoleSubModulePermission> subModulePermissions = new HashSet<>();

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_profile_id")
    private UserProfile createdBy;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cloned_from_id")
    private SubRole clonedFrom;

    @OneToMany(mappedBy = "clonedFrom")
    @Builder.Default
    private Set<SubRole> clonedRoles = new HashSet<>();

    @Builder.Default
    private Boolean isCloned = false;

    @Builder.Default
    private Boolean isActive = true;
}
