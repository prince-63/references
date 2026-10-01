package com.dentalstack.doctor.entity;

import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.entity.user.UserProfile;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "customer_access_and_revoke",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"user_profile_id", "organization_id"})},
        indexes = {@Index(name = "ix_profile_org", columnList = "user_profile_id, organization_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerAccessAndRevoke extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = true)
    private Boolean isTrackingEnabled;

    @Column(nullable = true)
    private Boolean isStlFileViewEnabled;

    @Column(nullable = true)
    private Boolean isScanFileViewEnabled;

    @Column(nullable = true)
    private Boolean isPrintFileViewEnabled;
}
