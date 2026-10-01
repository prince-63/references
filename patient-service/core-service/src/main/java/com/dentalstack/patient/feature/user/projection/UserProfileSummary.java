package com.dentalstack.patient.feature.user.projection;

import com.dentalstack.patient.global.enums.CountryCode;

public interface UserProfileSummary {
    Long getProfileId();

    String getFirstName();

    String getLastName();

    String getEmail();

    String getMobileNo();

    Long getDoctorId();

    Long getOrganizationId();

    String getDisplayName();

    String getBillingName();

    CountryCode getCountryCode();

    String getSalutation();

    String getDisplayPicture();

    String getProfilePicture();

    String getProfileType();

    String getOrgName();

    default String getEffectiveDisplayName() {
        return getDisplayName() != null
                ? getDisplayName()
                : String.format(
                                "%s%s%s %s",
                                getSalutation() != null ? getSalutation() + "." : "",
                                getSalutation() != null ? " " : "",
                                getFirstName(),
                                getLastName())
                        .trim();
    }

    default String getEffectiveDisplayNameWithoutSalutation() {
        return getDisplayName() != null
                ? getDisplayName()
                : String.format("%s %s", getFirstName(), getLastName()).trim();
    }
}
