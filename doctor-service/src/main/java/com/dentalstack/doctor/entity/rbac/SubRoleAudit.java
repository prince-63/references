package com.dentalstack.doctor.entity.rbac;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.rbac.AuditAction;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "sub_role_audit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubRoleAudit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_role_id", nullable = false)
    private SubRole subRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_profile_id", nullable = false)
    private UserProfile assignedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_profile_id")
    private UserProfile assignedTo;

    @NotNull
    @Enumerated(EnumType.STRING)
    private AuditAction action;

    private String changeDescription;

    @Column(columnDefinition = "TEXT")
    private String previousValue;

    @Column(columnDefinition = "TEXT")
    private String newValue;
}
