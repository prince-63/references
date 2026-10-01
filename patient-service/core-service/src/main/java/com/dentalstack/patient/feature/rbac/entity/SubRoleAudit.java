package com.dentalstack.patient.feature.rbac.entity;

import com.dentalstack.patient.feature.rbac.enums.AuditAction;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
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
    @JoinColumn(name = "sub_role_id")
    private SubRole subRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_profile_id", nullable = false)
    private UserProfile assignedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_profile_id")
    private UserProfile assignedTo;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "action")
    private AuditAction action;

    @Column(name = "change_description")
    private String changeDescription;

    @Column(name = "previous_value", columnDefinition = "TEXT")
    private String previousValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "role_name")
    private String roleName;

    @Column(name = "permission_name")
    private String permissionName;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "audit_timestamp")
    private LocalDateTime auditTimestamp;

    @PrePersist
    public void prePersist() {
        this.auditTimestamp = LocalDateTime.now();
    }
}
