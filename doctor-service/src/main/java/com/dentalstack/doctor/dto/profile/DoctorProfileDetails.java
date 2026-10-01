package com.dentalstack.doctor.dto.profile;

import com.dentalstack.doctor.entity.user.User;
import com.dentalstack.doctor.entity.user.UserProfile;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorProfileDetails {

    private long organizationId;
    private long doctorId;
    private String profileName;
    private String profileUrl;
    private Long profileImageId;
    private boolean isDefault;
    private String salutation;
    private String email;
    private long profileId;
    private String firstName;
    private String companyBrandProfilePicture;
    private Long companyBrandProfilePictureId;

    public static DoctorProfileDetails from(UserProfile userProfile) {
        if (userProfile == null) {
            return null;
        }

        User user = userProfile.getUser();

        return DoctorProfileDetails.builder()
                .organizationId(userProfile.getOrganization().getId())
                .doctorId(userProfile.getDoctor().getId())
                .profileName(user.fullNameWithSalutation())
                .profileUrl(user.getProfileUrl())
                .profileImageId(
                        user.getProfileImage() != null ? user.getProfileImage().getId() : null)
                .isDefault(Objects.equals(
                        userProfile.getDoctor().getPrimaryUserProfile().getId(), userProfile.getId()))
                .salutation(user.getSalutation())
                .email(user.getEmail())
                .profileId(userProfile.getId())
                .firstName(userProfile.getUser().fullNameWithSalutation())
                .companyBrandProfilePicture(
                        userProfile.getDoctorBilling() != null
                                ? userProfile.getDoctorBilling().getCompanyBrandProfilePicture()
                                : null)
                .companyBrandProfilePictureId(
                        userProfile.getDoctorBilling() != null
                                        && userProfile.getDoctorBilling().getCompanyBrandProfileImage() != null
                                ? userProfile
                                        .getDoctorBilling()
                                        .getCompanyBrandProfileImage()
                                        .getId()
                                : null)
                .build();
    }
}
