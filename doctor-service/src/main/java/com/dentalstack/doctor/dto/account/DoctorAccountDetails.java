package com.dentalstack.doctor.dto.account;

import com.dentalstack.doctor.entity.user.User;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.summary.UserProfileSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorAccountDetails {

    private String firstName;
    private String lastName;
    private String email;
    private String mobileNo;
    private Long doctorId;
    private Long organizationId;
    private Long profileId;
    private String displayName;
    private String displayPicture;
    private Long displayPictureId;
    private String profilePicture;
    private Long profilePictureId;
    private String salutation;
    private String countryCode;
    private String profileType;

    public static DoctorAccountDetails from(UserProfile userProfile) {
        if (userProfile == null) {
            return null;
        }
        User user = userProfile.getUser();
        return DoctorAccountDetails.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .mobileNo(user.getMobileNo())
                .doctorId(userProfile.getDoctor().getId())
                .organizationId(userProfile.getOrganization().getId())
                .profileId(userProfile.getId())
                .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.fullNameWithSalutation())
                .countryCode(user.getCountryCode().getCode())
                .salutation(user.getSalutation())
                .displayPicture(user.getDisplayProfileUrl())
                .displayPictureId(
                        user.getDisplayProfileImage() != null
                                ? user.getDisplayProfileImage().getId()
                                : null)
                .profilePictureId(
                        user.getProfileImage() != null ? user.getProfileImage().getId() : null)
                .profilePicture(user.getProfileUrl())
                .profileType(userProfile.getProfileType().toString())
                .build();
    }

    public static DoctorAccountDetails fromSummary(UserProfileSummary summary) {
        if (summary == null) {
            return null;
        }

        return DoctorAccountDetails.builder()
                .firstName(summary.getFirstName())
                .lastName(summary.getLastName())
                .email(summary.getEmail())
                .mobileNo(summary.getMobileNo())
                .doctorId(summary.getDoctorId())
                .organizationId(summary.getOrganizationId())
                .profileId(summary.getProfileId())
                .displayName(summary.getEffectiveDisplayName())
                .salutation(summary.getSalutation())
                .displayPicture(summary.getDisplayPicture())
                .profilePicture(summary.getProfilePicture())
                .profileType(summary.getProfileType())
                .countryCode(summary.getCountryCode().getCode())
                .displayPictureId(summary.getDisplayPictureId())
                .profilePictureId(summary.getProfilePictureId())
                .build();
    }
}
