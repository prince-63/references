package com.dentalstack.patient.feature.user.entity;

import com.dentalstack.patient.feature.billing.entity.DoctorBilling;
import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.doctor.entity.organization.Organization;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.user.enums.ProfileStatus;
import com.dentalstack.patient.feature.user.enums.ProfileType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Entity
@Table(name = "user_profile")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile extends BaseEntity {

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProfileType profileType;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "doctor_billing_id", referencedColumnName = "id")
    private DoctorBilling doctorBilling;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProfileStatus status;

    private String organizationBrandName;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_profile_role",
            joinColumns = @JoinColumn(name = "user_profile_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inviter_profile_id")
    private UserProfile inviterProfile;

    public static boolean isAlignerCompanyOrLab(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.ALIGNER_COMPANY_OR_LAB.name()));
    }

    public String getOrgName() {
        return doctorBilling != null ? doctorBilling.getCompanyBrandName() : user.fullName();
    }
}
