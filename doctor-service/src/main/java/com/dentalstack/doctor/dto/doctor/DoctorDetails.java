package com.dentalstack.doctor.dto.doctor;

import com.dentalstack.doctor.dto.rbac.ClonedFromSubRoleResponse;
import com.dentalstack.doctor.dto.rbac.ModuleResponse;
import com.dentalstack.doctor.dto.rbac.SubModuleResponse;
import com.dentalstack.doctor.dto.rbac.SubRoleResponse;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.rbac.Module;
import com.dentalstack.doctor.entity.rbac.SubRole;
import com.dentalstack.doctor.entity.rbac.SubRoleSubModulePermission;
import com.dentalstack.doctor.enums.organization.ProfileStatus;
import com.dentalstack.doctor.enums.organization.ProfileType;
import com.dentalstack.doctor.enums.rbac.SubRoleTag;
import jakarta.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorDetails {
    private Long id;
    private String UUID;
    private String firstName;
    private String lastName;
    private String address;
    private String city;
    private String email;
    private String mobile;
    private String countryName;
    private Long patientId;
    private Long doctorId;
    private boolean active;
    private String practiceLocationName;
    private boolean visible;
    private String description;
    private String dciNumber;
    private String doctorImage;
    private String countryCode;
    private boolean isDrToDisplay;
    private String orgName;
    private String salutation;
    private List<OrganizationDetails> organizations;
    private List<ProfileDetails> profiles;
    private Long ownerId;
    private Long ownerProfileId;
    private String xOrganizationName;
    private Long organizationId;

    @Nullable
    private ProfileDetails defaultProfile;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileDetails {
        private long profileId;
        private long organizationId;
        private long doctorId;
        private ProfileType profileType;
        private ProfileStatus status;
        private String displayName;
        private String displayPicture;
        private Long displayPictureId;
        private String organizationName;
        private String ownerOrganizationName;
        private Long ownerProfileId;
        private Long ownerDoctorId;
        private List<RoleDetails> roles;
        private Boolean displayNameAdded;
        private Boolean brandNameAdded;
        private String firstName;
        private String lastName;
        private String salutation;
        private String profilePicture;
        private Long profilePictureId;
        private Long subroleId;
        private String subroleName;
        private SubRoleTag subRoleTag;
        private String orgName;
        private Boolean isCustomerTrackingEnabled;
        private Boolean isStlFileViewEnabled;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class RoleDetails {
            private String name;
            private String description;
            private List<AllowedFeatureDetails> allowedFeatures;

            @Builder
            @Getter
            @Setter
            public static class AllowedFeatureDetails {
                private String featureName;
                private String featureDescription;
                private String permissionName;
                private String permissionDescription;
            }
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationDetails {
        private long organizationId;
        private String name;
        private String description;
        private boolean active;
    }

    public static DoctorDetails from(Doctor doctor) {
        return DoctorDetails.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .email(doctor.getEmail())
                .mobile(doctor.getMobile())
                .countryName(doctor.getCountryName())
                .doctorId(doctor.getId())
                .active(doctor.isActive())
                .visible(doctor.isActive())
                .description(doctor.getDescription())
                .UUID(doctor.getUUID())
                .doctorImage(doctor.getProfileImage())
                .countryCode(doctor.getCountryCode())
                .isDrToDisplay(doctor.isDrToDisplay())
                .orgName(doctor.getOrgName())
                .salutation(doctor.getSalutation())
                .countryCode(doctor.getCountryCode())
                .xOrganizationName(doctor.getXOrganizationName())
                .organizationId(doctor.getOrganizationId())
                .build();
    }

    public static DoctorDetails doctorDetails(Doctor doctor) {
        return DoctorDetails.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .email(doctor.getEmail())
                .mobile(doctor.getMobile())
                .countryName(doctor.getCountryName())
                .doctorId(doctor.getId())
                .active(doctor.isActive())
                .visible(doctor.isActive())
                .description(doctor.getDescription())
                .UUID(doctor.getUUID())
                .doctorImage(doctor.getProfileImage())
                .countryCode(doctor.getCountryCode())
                .isDrToDisplay(doctor.isDrToDisplay())
                .orgName(doctor.getOrgName())
                .organizations(doctor.getOrganizationsData())
                .salutation(doctor.getSalutation())
                .xOrganizationName(doctor.getXOrganizationName())
                .organizationId(doctor.getOrganizationId())
                .profiles(doctor.getUserProfiles().stream()
                        .map(profile -> ProfileDetails.builder()
                                .profileId(profile.getId())
                                .organizationId(profile.getOrganization().getId())
                                .doctorId(profile.getDoctor().getId())
                                .profileType(profile.getProfileType())
                                .status(profile.getStatus())
                                .displayName(profile.getUser().displayName())
                                .displayPicture(profile.getUser().getDisplayProfileUrl())
                                .organizationName(profile.getUserProfileOrgName())
                                .roles(profile.getRolesData())
                                .ownerOrganizationName(
                                        profile.getInviterProfile() != null ? profile.getUserProfileOrgName() : null)
                                .ownerDoctorId(
                                        profile.getInviterProfile() != null
                                                ? profile.getInviterProfile()
                                                        .getDoctor()
                                                        .getId()
                                                : null)
                                .ownerProfileId(
                                        profile.getInviterProfile() != null
                                                ? profile.getInviterProfile().getId()
                                                : null)
                                .subroleId(
                                        profile.getSubRole() != null
                                                ? profile.getSubRole().getId()
                                                : null)
                                .subroleName(
                                        profile.getSubRole() != null
                                                ? profile.getSubRole().getName()
                                                : null)
                                .subRoleTag(
                                        profile.getSubRole() != null
                                                ? profile.getSubRole().getSubRoleTag()
                                                : null)
                                .orgName(profile.getOrganizationBrandName())
                                .build())
                        .collect(Collectors.toList()))
                .defaultProfile(
                        doctor.getPrimaryUserProfile() != null
                                ? ProfileDetails.builder()
                                        .profileId(
                                                doctor.getPrimaryUserProfile().getId())
                                        .profileType(
                                                doctor.getPrimaryUserProfile().getProfileType())
                                        .status(doctor.getPrimaryUserProfile().getStatus())
                                        .organizationId(
                                                doctor.getPrimaryUserProfile().getUserProfileOrganizationId())
                                        .doctorId(doctor.getPrimaryUserProfile().gerUserProfileDoctorId())
                                        .displayName(
                                                doctor.getPrimaryUserProfile().getUserProfileDisplayName())
                                        .displayPicture(
                                                doctor.getPrimaryUserProfile().getUserProfileDisplayPicture())
                                        .organizationName(
                                                doctor.getPrimaryUserProfile().getUserProfileOrgName())
                                        .ownerOrganizationName(
                                                doctor.getPrimaryUserProfile().getInviterProfile() != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getInviterProfile()
                                                                .getUserProfileOrgName()
                                                        : null)
                                        .ownerDoctorId(
                                                doctor.getPrimaryUserProfile().getInviterProfile() != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getInviterProfile()
                                                                .getDoctor()
                                                                .getId()
                                                        : null)
                                        .ownerProfileId(
                                                doctor.getPrimaryUserProfile().getInviterProfile() != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getInviterProfile()
                                                                .getId()
                                                        : null)
                                        .roles(doctor.getPrimaryUserProfile().getRolesData())
                                        .subroleId(
                                                doctor.getPrimaryUserProfile().getSubRole() != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getSubRole()
                                                                .getId()
                                                        : null)
                                        .subroleName(
                                                doctor.getPrimaryUserProfile().getSubRole() != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getSubRole()
                                                                .getName()
                                                        : null)
                                        .subRoleTag(
                                                doctor.getPrimaryUserProfile().getSubRole() != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getSubRole()
                                                                .getSubRoleTag()
                                                        : null)
                                        .orgName(doctor.getPrimaryUserProfile().getOrganizationBrandName())
                                        .build()
                                : null)
                .build();
    }

    private static SubRoleResponse buildSubRoleResponse(SubRole subRole) {
        if (subRole == null) {
            return null;
        }

        List<ModuleResponse> modules = buildModuleResponsesForSubRole(subRole);

        return SubRoleResponse.builder()
                .id(subRole.getId())
                .name(subRole.getName())
                .description(subRole.getDescription())
                .subRoleTag(subRole.getSubRoleTag())
                .modules(modules)
                .clonedFromSubRole(
                        subRole.getClonedFrom() != null
                                ? ClonedFromSubRoleResponse.from(subRole.getClonedFrom())
                                : null)
                .build();
    }

    private static List<ModuleResponse> buildModuleResponsesForSubRole(SubRole subRole) {
        if (subRole.getSubModulePermissions() == null
                || subRole.getSubModulePermissions().isEmpty()) {
            return new ArrayList<>();
        }

        Map<com.dentalstack.doctor.entity.rbac.Module, List<SubRoleSubModulePermission>> moduleToSubModulePermissions =
                subRole.getSubModulePermissions().stream()
                        .collect(Collectors.groupingBy(
                                permission -> permission.getSubModule().getModule()));

        return moduleToSubModulePermissions.entrySet().stream()
                .map(entry -> {
                    Module module = entry.getKey();
                    List<SubRoleSubModulePermission> subModulePermissions = entry.getValue();

                    List<SubModuleResponse> subModuleResponses = subModulePermissions.stream()
                            .map(permission -> SubModuleResponse.builder()
                                    .id(permission.getSubModule().getId())
                                    .name(permission.getSubModule().getName())
                                    .description(permission.getSubModule().getDescription())
                                    .permissions(new ArrayList<>(permission.getPermissions()))
                                    .build())
                            .collect(Collectors.toList());

                    return ModuleResponse.builder()
                            .id(module.getId())
                            .name(module.getName())
                            .description(module.getDescription())
                            .subModules(subModuleResponses)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public static DoctorDetails newEntry(Doctor doctor) {
        return DoctorDetails.builder()
                .email(doctor.getEmail())
                .doctorId(doctor.getId())
                .active(doctor.isActive())
                .UUID(doctor.getUUID())
                .isDrToDisplay(doctor.isDrToDisplay())
                .salutation(doctor.getSalutation())
                .build();
    }

    public static DoctorDetails fromDoctor(Doctor doctor, String practiceLocationName) {
        return DoctorDetails.builder()
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .email(doctor.getEmail())
                .mobile(doctor.getMobile())
                .countryName(doctor.getCountryName())
                .doctorId(doctor.getId())
                .active(doctor.isActive())
                .visible(doctor.isActive())
                .practiceLocationName(practiceLocationName)
                .description(doctor.getDescription())
                .UUID(doctor.getUUID())
                .doctorImage(doctor.getProfileImage())
                .countryCode(doctor.getCountryCode())
                .isDrToDisplay(doctor.isDrToDisplay())
                .orgName(doctor.getOrgName())
                .salutation(doctor.getSalutation())
                .xOrganizationName(doctor.getXOrganizationName())
                .organizationId(doctor.getOrganizationId())
                .build();
    }

    public static DoctorDetails fromDoctor(Doctor doctor, String practiceLocationName, String city) {
        return DoctorDetails.builder()
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .city(city)
                .email(doctor.getEmail())
                .mobile(doctor.getMobile())
                .countryName(doctor.getCountryName())
                .doctorId(doctor.getId())
                .active(doctor.isActive())
                .visible(doctor.isActive())
                .practiceLocationName(practiceLocationName)
                .description(doctor.getDescription())
                .UUID(doctor.getUUID())
                .doctorImage(doctor.getProfileImage())
                .countryCode(doctor.getCountryCode())
                .isDrToDisplay(doctor.isDrToDisplay())
                .orgName(doctor.getOrgName())
                .salutation(doctor.getSalutation())
                .xOrganizationName(doctor.getXOrganizationName())
                .organizationId(doctor.getOrganizationId())
                .build();
    }

    public static DoctorDetails doctorDetails(Doctor doctor, Long ownerId, Long ownerProfileId) {
        return DoctorDetails.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .email(doctor.getEmail())
                .mobile(doctor.getMobile())
                .countryName(doctor.getCountryName())
                .doctorId(doctor.getId())
                .active(doctor.isActive())
                .visible(doctor.isActive())
                .description(doctor.getDescription())
                .UUID(doctor.getUUID())
                .doctorImage(doctor.getProfileImage())
                .countryCode(doctor.getCountryCode())
                .isDrToDisplay(doctor.isDrToDisplay())
                .orgName(doctor.getOrgName())
                .organizations(doctor.getOrganizationsData())
                .ownerId(ownerId)
                .ownerProfileId(ownerProfileId)
                .salutation(doctor.getSalutation())
                .xOrganizationName(doctor.getXOrganizationName())
                .organizationId(doctor.getOrganizationId())
                .profiles(doctor.getUserProfiles().stream()
                        .map(profile -> ProfileDetails.builder()
                                .profileId(profile.getId())
                                .organizationId(profile.getOrganization().getId())
                                .doctorId(profile.getDoctor().getId())
                                .profileType(profile.getProfileType())
                                .status(profile.getStatus())
                                .displayName(profile.getUser().displayName())
                                .displayPicture(profile.getUser().getDisplayProfileUrl())
                                .organizationName(profile.getUserProfileOrgName())
                                .roles(profile.getRolesData())
                                .ownerOrganizationName(
                                        profile.getInviterProfile() != null ? profile.getUserProfileOrgName() : null)
                                .ownerDoctorId(
                                        profile.getInviterProfile() != null
                                                ? profile.getInviterProfile()
                                                        .getDoctor()
                                                        .getId()
                                                : null)
                                .ownerProfileId(
                                        profile.getInviterProfile() != null
                                                ? profile.getInviterProfile().getId()
                                                : null)
                                .build())
                        .collect(Collectors.toList()))
                .defaultProfile(
                        doctor.getPrimaryUserProfile() != null
                                ? ProfileDetails.builder()
                                        .profileId(
                                                doctor.getPrimaryUserProfile().getId())
                                        .profileType(
                                                doctor.getPrimaryUserProfile().getProfileType())
                                        .status(doctor.getPrimaryUserProfile().getStatus())
                                        .organizationId(
                                                doctor.getPrimaryUserProfile().getUserProfileOrganizationId())
                                        .doctorId(doctor.getPrimaryUserProfile().gerUserProfileDoctorId())
                                        .displayName(
                                                doctor.getPrimaryUserProfile().getUserProfileDisplayName())
                                        .displayPicture(
                                                doctor.getPrimaryUserProfile().getUserProfileDisplayPicture())
                                        .organizationName(
                                                doctor.getPrimaryUserProfile().getUserProfileOrgName())
                                        .ownerOrganizationName(
                                                doctor.getPrimaryUserProfile().getInviterProfile() != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getInviterProfile()
                                                                .getUserProfileOrgName()
                                                        : null)
                                        .ownerDoctorId(
                                                doctor.getPrimaryUserProfile().getInviterProfile() != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getInviterProfile()
                                                                .getDoctor()
                                                                .getId()
                                                        : null)
                                        .ownerProfileId(
                                                doctor.getPrimaryUserProfile().getInviterProfile() != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getInviterProfile()
                                                                .getId()
                                                        : null)
                                        .roles(doctor.getPrimaryUserProfile().getRolesData())
                                        .build()
                                : null)
                .build();
    }
}
