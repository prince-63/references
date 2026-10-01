package com.dentalstack.auth.dto.doctor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DoctorDetails {
    private Long id;
    private String UUID;
    private String firstName;
    private String lastName;
    private String middleName;
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
    private List<OrganizationDetails> organizations;
    private List<ProfileDetails> profiles;
    private Long ownerId;
    private Long ownerProfileId;
    private String salutation;
    private String orgName;
    private String countryCode;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileDetails {
        private long profileId;
        private long organizationId;
        private long doctorId;
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
}
