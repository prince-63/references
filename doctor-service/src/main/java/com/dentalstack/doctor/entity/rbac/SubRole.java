package com.dentalstack.doctor.entity.rbac;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.rbac.SubRoleTag;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;
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

    private Boolean isCloned = false;

    private Boolean isActive = true;

    public boolean isSuperAdminOfStandardPlans() {
        if (this.plan == null || this.plan.getName() == null) {
            return false;
        }

        String planName = this.plan.getName();
        return SubRoleTag.DEFAULT.equals(this.subRoleTag)
                && ("DESIGN_LAB".equals(planName) || "ENTERPRISE".equals(planName) || "PROFESSIONAL".equals(planName));
    }
}
