package com.dentalstack.patient.feature.user.entity;

import com.dentalstack.patient.feature.billing.entity.DoctorBilling;
import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.doctor.entity.Organization;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileStatus;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationRequest;
import com.dentalstack.patient.feature.rbac.entity.Plan;
import com.dentalstack.patient.feature.rbac.entity.SubRole;
import com.dentalstack.patient.feature.rbac.enums.SubRoleTag;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Supplier;
import lombok.*;

@Entity
@Table(name = "user_profile")
@Getter
@Setter
@ToString(exclude = {"user", "organization", "doctor", "doctorBilling", "inviterProfile", "roles", "plan", "subRole"})
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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_profile_role",
            joinColumns = @JoinColumn(name = "user_profile_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inviter_profile_id")
    private UserProfile inviterProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private Plan plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_role_id")
    private SubRole subRole;

    private String organizationBrandName;

    private Boolean isTrackingEnabled;

    @Column(name = "is_stl_file_view_enabled")
    private Boolean isStlFileViewEnabled;

    public static boolean isAlignerCompanyOrLab(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.ALIGNER_COMPANY_OR_LAB.name()));
    }

    public static boolean isEnterpriseCompanyLab(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
    }

    public boolean isPractice() {
        boolean hasConsultingOrthodontistRole = this.roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.CONSULTING_ORTHODONTIST.name()));

        return hasConsultingOrthodontistRole && this.profileType == ProfileType.INVITED;
    }

    public boolean isStarter() {
        boolean hasConsultingOrthodontistRole = this.roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.CONSULTING_ORTHODONTIST.name()));

        return hasConsultingOrthodontistRole && this.profileType == ProfileType.OWNER;
    }

    public boolean isOwner() {
        return this.inviterProfile == null && this.profileType == ProfileType.OWNER;
    }

    public boolean isConsultingOrthodontist() {
        boolean hasConsultingOrthodontistRole = this.roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.CONSULTING_ORTHODONTIST.name()));

        return hasConsultingOrthodontistRole && this.profileType == ProfileType.OWNER;
    }

    public static boolean isCommercialAlignerLab(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.COMMERCIAL_ALIGNER_LAB.name()));
    }

    public boolean isInHouseManufacturingLab() {
        Set<String> validRoleNames = Set.of(DoctorRole.IN_OFFICE_MANUFACTURER.name());
        return this.roles.stream().map(Role::getName).anyMatch(validRoleNames::contains);
    }

    public boolean isEnterprise() {
        Set<String> validRoleNames = Set.of(DoctorRole.ENTERPRISE_COMPANY_LAB.name());
        return this.roles.stream().map(Role::getName).anyMatch(validRoleNames::contains);
    }

    public boolean isInternalUser() {
        Set<String> validRoleNames = Set.of(DoctorRole.INTERNAL_USER.name());
        return this.roles.stream().map(Role::getName).anyMatch(validRoleNames::contains);
    }

    public boolean isCustomInternalUser() {
        Set<String> validRoleNames = Set.of(DoctorRole.INTERNAL_USER.name());
        var isCustom = subRole.getSubRoleTag().equals(SubRoleTag.CUSTOM);
        return this.roles.stream().map(Role::getName).anyMatch(validRoleNames::contains) && isCustom;
    }

    public boolean isDefaultInternalUser() {
        Set<String> validRoleNames = Set.of(DoctorRole.INTERNAL_USER.name());
        var isDefault = subRole.getSubRoleTag().equals(SubRoleTag.DEFAULT);
        return this.roles.stream().map(Role::getName).anyMatch(validRoleNames::contains) && isDefault;
    }

    public boolean isEnterpriseOrDesignLab() {
        Set<String> validRoleNames = Set.of(
                DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                DoctorRole.ENTERPRISE_COMPANY_LAB.name());

        return this.roles.stream().map(Role::getName).anyMatch(validRoleNames::contains);
    }

    public String getOrgName() {
        return (doctorBilling != null && doctorBilling.getCompanyBrandName() != null)
                ? doctorBilling.getCompanyBrandName()
                : user.fullNameWithSalutation();
    }

    public boolean isAdminWithDefaultTag() {
        if (this.subRole == null) {
            return false;
        }

        return "ADMIN".equalsIgnoreCase(this.subRole.getName()) && this.subRole.getSubRoleTag() == SubRoleTag.DEFAULT;
    }

    public String getPracticeName() {
        return user.fullName();
    }

    public String getLabName() {
        return user.fullName();
    }

    public static void updateDoctorAccount(UserProfile userProfile, DoctorInvitationRequest request) {
        User user = userProfile.getUser();
        updateIfPresent(request::getLastName, user::setLastName);
        updateIfPresent(request::getFirstName, user::setFirstName);
        updateIfPresent(request::getMobileNo, user::setMobileNo);
        updateIfPresent(request::getCountryCode, user::setCountryCode);
        updateIfPresent(request::getSalutation, user::setSalutation);
    }

    private static <T> void updateIfPresent(Supplier<T> getter, Consumer<T> setter) {
        Optional.ofNullable(getter.get()).ifPresent(setter);
    }
}
