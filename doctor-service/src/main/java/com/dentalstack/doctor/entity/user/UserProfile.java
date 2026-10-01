package com.dentalstack.doctor.entity.user;

import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.billing.DoctorBilling;
import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.entity.rbac.Plan;
import com.dentalstack.doctor.entity.rbac.SubRole;
import com.dentalstack.doctor.enums.doctor.DoctorRole;
import com.dentalstack.doctor.enums.organization.ProfileStatus;
import com.dentalstack.doctor.enums.organization.ProfileType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
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

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    @JsonBackReference("doctor-profiles")
    private Doctor doctor;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inviter_profile_id")
    @JsonIgnoreProperties({"inviterProfile", "doctor"})
    private UserProfile inviterProfile;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProfileType profileType;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "doctor_billing_id", referencedColumnName = "id")
    private DoctorBilling doctorBilling;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProfileStatus status;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_profile_role",
            joinColumns = @JoinColumn(name = "user_profile_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

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

    @ElementCollection
    @CollectionTable(name = "user_selected_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "selected_role")
    private List<String> selectedRoles = new ArrayList<>();

    public List<DoctorDetails.ProfileDetails.RoleDetails> getRolesData() {
        return roles.stream()
                .map(role -> DoctorDetails.ProfileDetails.RoleDetails.builder()
                        .name(role.getName())
                        .description(role.getDescription())
                        .allowedFeatures(role.getAllowedFeatures().stream()
                                .map(allowedFeature ->
                                        DoctorDetails.ProfileDetails.RoleDetails.AllowedFeatureDetails.builder()
                                                .featureName(allowedFeature
                                                        .getFeature()
                                                        .getName())
                                                .featureDescription(allowedFeature
                                                        .getFeature()
                                                        .getDescription())
                                                .permissionName(allowedFeature
                                                        .getPermission()
                                                        .getName())
                                                .permissionDescription(allowedFeature
                                                        .getPermission()
                                                        .getDescription())
                                                .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    // profile details
    public String getUserProfileDisplayName() {
        return user.getDisplayName() != null ? user.getDisplayName() : user.fullNameWithSalutation();
    }

    public boolean isPractice() {
        boolean hasConsultingOrthodontistRole = this.roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.CONSULTING_ORTHODONTIST.name()));

        return hasConsultingOrthodontistRole && this.profileType == ProfileType.INVITED;
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
        boolean hasConsultingOrthodontistRole = this.roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.INTERNAL_USER.name()));

        return hasConsultingOrthodontistRole && this.profileType == ProfileType.INVITED;
    }

    public String getUserProfileDisplayPicture() {
        return user.getDisplayProfileUrl();
    }

    public String getUserProfileOrgName() {
        return doctorBilling != null ? doctorBilling.getCompanyBrandName() : user.fullNameWithSalutation();
    }

    public long gerUserProfileDoctorId() {
        return doctor.getId();
    }

    public boolean isOwner() {
        return this.inviterProfile == null && this.profileType == ProfileType.OWNER;
    }

    public long getUserProfileOrganizationId() {
        return organization.getId();
    }

    public String getOrgName() {
        return doctorBilling != null ? doctorBilling.getCompanyBrandName() : user.displayName();
    }

    public String getPracticeName() {
        return user.fullName();
    }
}
