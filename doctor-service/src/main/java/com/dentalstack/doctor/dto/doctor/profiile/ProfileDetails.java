package com.dentalstack.doctor.dto.doctor.profiile;

import com.dentalstack.doctor.entity.Doctor;
import java.util.List;
import java.util.stream.Collectors;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDetails {
    private long profileId;
    private long doctorId;
    private long organizationId;
    private String profileType;
    private String status;
    private List<RoleDetails> roles;
    private List<OrganizationDetails> organizations;

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

    public static ProfileDetails doctorDetails(Doctor doctor) {
        return ProfileDetails.builder()
                .doctorId(doctor.getId())
                .organizations(doctor.getOrganizations().stream()
                        .map(organization -> OrganizationDetails.builder()
                                .name(organization.getName())
                                .organizationId(organization.getId())
                                .description(organization.getDescription())
                                .active(organization.isActive())
                                .build())
                        .collect(Collectors.toList()))
                .roles(doctor.getUserProfiles().stream()
                        .flatMap(profile -> profile.getRoles().stream().map(role -> RoleDetails.builder()
                                .name(role.getName())
                                .description(role.getDescription())
                                .allowedFeatures(role.getAllowedFeatures().stream()
                                        .map(allowedFeature -> RoleDetails.AllowedFeatureDetails.builder()
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
                                .build()))
                        .collect(Collectors.toList()))
                .build();
    }
}
