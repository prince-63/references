package com.dentalstack.patient.feature.rbac.projection;

import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.global.enums.CountryCode;

public interface InvitationSummaryProjection {
    String getFirstName();

    String getLastName();

    String getEmail();

    String getMobileNumber();

    String getSalutation();

    String getSubRoleName();

    InvitationStatus getInvitationStatus();

    Long getInvitationId();

    CountryCode getCountryCode();

    Long getSubRoleId();

    String getInviteCode();

    Long getInviterUserProfileId();

    Long getInvitedDoctorId();

    String getProfileImageUrl();

    Long getProfileImageId();
}
