package com.dentalstack.doctor.dto.doctor;

import com.dentalstack.doctor.dto.practicelocation.PLOfPatientResponse;
import com.dentalstack.doctor.dto.rbac.ClonedFromSubRoleResponse;
import com.dentalstack.doctor.dto.rbac.ModuleResponse;
import com.dentalstack.doctor.dto.rbac.SubModuleResponse;
import com.dentalstack.doctor.dto.rbac.SubRoleResponse;
import com.dentalstack.doctor.dto.subscription.Subscription;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.billing.DoctorBilling;
import com.dentalstack.doctor.entity.patient.organization.PatientDoctorOrganization;
import com.dentalstack.doctor.entity.rbac.Module;
import com.dentalstack.doctor.entity.rbac.SubRole;
import com.dentalstack.doctor.entity.rbac.SubRoleSubModulePermission;
import com.dentalstack.doctor.summary.DoctorDetailsSummary;
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
public class DoctorDetailsAll {
    private Long id;
    private String UUID;
    private String firstName;
    private String lastName;
    private String email;
    private String mobile;
    private String countryName;
    private Long doctorId;
    private boolean active;
    private boolean visible;
    private String description;
    private Long activePatient;
    private Long totalPatient;
    private Long practiceLocation;
    private String subscription;
    private String doctorProfile;
    private Long doctorProfileId;
    private String practiceLocationName;
    private Boolean isOnBoardScreenVisited;
    private String state;
    private String countryCode;
    private long newActivePatientCount;
    private int totalNewPatient;
    private boolean isDrToDisplay;
    private List<DoctorDetails.OrganizationDetails> organizations;
    private List<DoctorDetails.ProfileDetails> profiles;
    private List<Subscription> subscriptions;
    private String salutation;

    @Nullable
    private DoctorDetails.ProfileDetails defaultProfile;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileDetails {
        private long profileId;
        private long organizationId;
        private String profileType;
        private String status;
        private List<DoctorDetails.ProfileDetails.RoleDetails> roles;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class RoleDetails {
            private String name;
            private String description;
            private List<DoctorDetails.ProfileDetails.RoleDetails.AllowedFeatureDetails> allowedFeatures;

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

    public static DoctorDetailsAll from(
            Doctor doctor,
            Long activePatient,
            Long totalPatient,
            Long totalClinic,
            String subscription,
            long newActivePatient,
            int totalNewPatient,
            List<Subscription> subscriptions) {
        return DoctorDetailsAll.builder()
                .id(doctor.getId())
                .UUID(doctor.getUUID())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .salutation(doctor.getSalutation())
                .email(doctor.getEmail())
                .mobile(doctor.getMobile())
                .countryName(doctor.getCountryName())
                .doctorId(doctor.getId())
                .active(doctor.isActive())
                .visible(doctor.isActive())
                .description(doctor.getDescription())
                .activePatient(activePatient)
                .totalPatient(totalPatient)
                .practiceLocation(totalClinic)
                .subscription(subscription)
                .doctorProfile(doctor.getProfileImage())
                .isOnBoardScreenVisited(doctor.getIsOnBoardScreenVisited())
                .countryCode(doctor.getCountryCode())
                .newActivePatientCount(newActivePatient)
                .totalNewPatient(totalNewPatient)
                .isDrToDisplay(doctor.isDrToDisplay())
                .organizations(doctor.getOrganizationsData())
                .subscriptions(subscriptions)
                .profiles(doctor.getUserProfiles().stream()
                        .map(profile -> DoctorDetails.ProfileDetails.builder()
                                .profileId(profile.getId())
                                .organizationId(profile.getOrganization().getId())
                                .doctorId(profile.getDoctor().getId())
                                .profileType(profile.getProfileType())
                                .status(profile.getStatus())
                                .status(profile.getStatus())
                                .displayName(profile.getUserProfileDisplayName())
                                .displayPicture(profile.getUser().getDisplayProfileUrl())
                                .displayPictureId(
                                        profile.getUser().getDisplayProfileImage() != null
                                                ? profile.getUser()
                                                        .getDisplayProfileImage()
                                                        .getId()
                                                : null)
                                .organizationName(profile.getUserProfileOrgName())
                                .firstName(profile.getUser().getFirstName())
                                .lastName(profile.getUser().getLastName())
                                .salutation(profile.getUser().getSalutation())
                                .ownerOrganizationName(
                                        profile.getInviterProfile() != null
                                                ? (profile.getInviterProfile().getDoctorBilling() != null
                                                        ? profile.getInviterProfile()
                                                                .getDoctorBilling()
                                                                .getCompanyBrandName()
                                                        : profile.getInviterProfile()
                                                                .getUserProfileOrgName())
                                                : null)
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
                                .roles(profile.getRolesData())
                                .profilePicture(profile.getUser().getProfileUrl())
                                .profilePictureId(
                                        profile.getUser().getProfileImage() != null
                                                ? profile.getUser()
                                                        .getProfileImage()
                                                        .getId()
                                                : null)
                                .displayNameAdded(profile.getDoctorBilling() != null
                                        && profile.getDoctorBilling().getCompanyDisplayName() != null)
                                .brandNameAdded(profile.getDoctorBilling() != null
                                        && profile.getDoctorBilling().getCompanyBrandName() != null)
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
                                .isCustomerTrackingEnabled(profile.getIsTrackingEnabled())
                                .isStlFileViewEnabled(profile.getIsStlFileViewEnabled())
                                .build())
                        .collect(Collectors.toList()))
                .defaultProfile(
                        doctor.getPrimaryUserProfile() != null
                                ? DoctorDetails.ProfileDetails.builder()
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
                                        .displayPictureId(
                                                doctor.getPrimaryUserProfile()
                                                                        .getUser()
                                                                        .getDisplayProfileImage()
                                                                != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getUser()
                                                                .getDisplayProfileImage()
                                                                .getId()
                                                        : null)
                                        .organizationName(
                                                doctor.getPrimaryUserProfile().getUserProfileOrgName())
                                        .firstName(doctor.getPrimaryUserProfile()
                                                .getUser()
                                                .getFirstName())
                                        .lastName(doctor.getPrimaryUserProfile()
                                                .getUser()
                                                .getLastName())
                                        .salutation(doctor.getPrimaryUserProfile()
                                                .getUser()
                                                .getSalutation())
                                        .profilePicture(doctor.getPrimaryUserProfile()
                                                .getUser()
                                                .getProfileUrl())
                                        .profilePictureId(
                                                doctor.getPrimaryUserProfile()
                                                                        .getUser()
                                                                        .getProfileImage()
                                                                != null
                                                        ? doctor.getPrimaryUserProfile()
                                                                .getUser()
                                                                .getProfileImage()
                                                                .getId()
                                                        : null)
                                        .ownerOrganizationName(
                                                doctor.getPrimaryUserProfile().getInviterProfile() != null
                                                        ? doctor.getPrimaryUserProfile()
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
                                        .displayNameAdded(
                                                doctor.getPrimaryUserProfile().getDoctorBilling() != null
                                                        && doctor.getPrimaryUserProfile()
                                                                        .getDoctorBilling()
                                                                        .getCompanyDisplayName()
                                                                != null)
                                        .brandNameAdded(
                                                doctor.getPrimaryUserProfile().getDoctorBilling() != null
                                                        && doctor.getPrimaryUserProfile()
                                                                        .getDoctorBilling()
                                                                        .getCompanyBrandName()
                                                                != null)
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
                .planId(subRole.getPlan().getId())
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

    public static DoctorDetailsAll from(
            DoctorDetailsSummary doctorDetailsSummary,
            Long activePatient,
            Long totalPatient,
            Long totalClinic,
            String subscription,
            long newActivePatient,
            int totalNewPatient) {
        return DoctorDetailsAll.builder()
                .id(doctorDetailsSummary.getId())
                .UUID(doctorDetailsSummary.getUUID())
                .firstName(doctorDetailsSummary.getFirstName())
                .lastName(doctorDetailsSummary.getLastName())
                .email(doctorDetailsSummary.getEmail())
                .mobile(doctorDetailsSummary.getMobile())
                .countryName(doctorDetailsSummary.getCountryName())
                .doctorId(doctorDetailsSummary.getId())
                .active(true)
                .visible(true)
                .description(doctorDetailsSummary.getDescription())
                .activePatient(activePatient)
                .totalPatient(totalPatient)
                .practiceLocation(totalClinic)
                .subscription(subscription)
                .doctorProfile(doctorDetailsSummary.getProfileImage())
                .isOnBoardScreenVisited(doctorDetailsSummary.getIsOnBoardScreenVisited())
                .countryCode(null) // Country code is not in summary; adjust as needed
                .newActivePatientCount(newActivePatient)
                .totalNewPatient(totalNewPatient)
                .isDrToDisplay(doctorDetailsSummary.getIsDrToDisplay())
                .organizations(doctorDetailsSummary.getOrganizations().stream()
                        .map(org -> DoctorDetails.OrganizationDetails.builder()
                                .organizationId(org.getOrganizationId())
                                .name(org.getName())
                                .description(org.getDescription())
                                .active(org.getActive())
                                .build())
                        .collect(Collectors.toList()))
                .profiles(doctorDetailsSummary.getProfiles().stream()
                        .map(profile -> DoctorDetails.ProfileDetails.builder()
                                .profileId(profile.getProfileId())
                                .profileType(profile.getProfileType())
                                .status(profile.getStatus())
                                .build())
                        .collect(Collectors.toList()))
                .defaultProfile(null)
                .build();
    }

    public static DoctorDetailsAll from(
            Doctor doctor,
            Long activePatient,
            Long totalPatient,
            PLOfPatientResponse plOfPatientResponse,
            String subscription,
            long newActivePatientCount,
            int totalNewPatient) {
        return DoctorDetailsAll.builder()
                .id(doctor.getId())
                .UUID(doctor.getUUID())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .email(doctor.getEmail())
                .mobile(doctor.getMobile())
                .countryName(doctor.getCountryName())
                .doctorId(doctor.getId())
                .active(doctor.isActive())
                .visible(doctor.isActive())
                .description(doctor.getDescription())
                .activePatient(activePatient)
                .totalPatient(totalPatient)
                .practiceLocationName(plOfPatientResponse.getPracticeLocationName())
                .subscription(subscription)
                .doctorProfile(doctor.getProfileImage())
                .isOnBoardScreenVisited(doctor.getIsOnBoardScreenVisited())
                .countryCode(doctor.getCountryCode())
                .newActivePatientCount(newActivePatientCount)
                .totalNewPatient(totalNewPatient)
                .isDrToDisplay(doctor.isDrToDisplay())
                .build();
    }

    public static DoctorDetailsAll from(
            Doctor doctor,
            Long activePatient,
            Long totalPatient,
            PLOfPatientResponse plOfPatientResponse,
            String subscription,
            long newActivePatientCount,
            int totalNewPatient,
            PatientDoctorOrganization patientDoctorOrganization) {

        DoctorBilling doctorBilling = patientDoctorOrganization.getUserProfile().getDoctorBilling();
        return DoctorDetailsAll.builder()
                .id(doctor.getId())
                .UUID(doctor.getUUID())
                .firstName(
                        doctorBilling != null
                                ? doctorBilling.getCompanyDisplayName()
                                : patientDoctorOrganization
                                        .getUserProfile()
                                        .getUser()
                                        .getFirstName())
                .lastName(
                        doctorBilling != null
                                ? ""
                                : patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                        .getLastName()
                                                != null
                                        ? patientDoctorOrganization
                                                .getUserProfile()
                                                .getUser()
                                                .getLastName()
                                        : "")
                .email(doctor.getEmail())
                .mobile(doctor.getMobile())
                .countryName(doctor.getCountryName())
                .doctorId(doctor.getId())
                .active(doctor.isActive())
                .visible(doctor.isActive())
                .description(doctor.getDescription())
                .activePatient(activePatient)
                .totalPatient(totalPatient)
                .practiceLocationName(plOfPatientResponse.getPracticeLocationName())
                .subscription(subscription)
                .doctorProfile(doctorBilling != null ? doctorBilling.getCompanyImageUrl() : null)
                .doctorProfileId(
                        doctorBilling != null && doctorBilling.getCompanyImage() != null
                                ? doctorBilling.getCompanyImage().getId()
                                : null)
                .isOnBoardScreenVisited(doctor.getIsOnBoardScreenVisited())
                .countryCode(doctor.getCountryCode())
                .newActivePatientCount(newActivePatientCount)
                .totalNewPatient(totalNewPatient)
                .isDrToDisplay(false)
                .build();
    }
}
