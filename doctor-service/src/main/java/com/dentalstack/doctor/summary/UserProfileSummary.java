package com.dentalstack.doctor.summary;

import com.dentalstack.doctor.enums.user.CountryCode;

public interface UserProfileSummary {
    Long getProfileId();

    String getFirstName();

    String getLastName();

    String getEmail();

    String getMobileNo();

    Long getDoctorId();

    Long getOrganizationId();

    String getDisplayName();

    CountryCode getCountryCode();

    String getSalutation();

    String getDisplayPicture();

    Long getDisplayPictureId();

    String getProfilePicture();

    Long getProfilePictureId();

    String getProfileType();

    String getCompanyBrandName();

    String getCompanyBrandProfilePicture();

    // Default method to handle display name fallback
    default String getEffectiveDisplayName() {
        if (getDisplayName() != null) {
            return getDisplayName().replaceAll("(?<=\\bDr\\.)(?!\\s)", " ").trim();
        }

        StringBuilder nameBuilder = new StringBuilder();
        if (getSalutation() != null) {
            nameBuilder.append(getSalutation()).append(". ");
        }
        nameBuilder.append(getFirstName());
        if (getLastName() != null) {
            nameBuilder.append(" ").append(getLastName());
        }

        return nameBuilder.toString().trim();
    }
}
