package com.dentalstack.doctor.summary;

import com.dentalstack.doctor.enums.invitation.InvitationRole;
import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.enums.invitation.UserRegistrationType;
import com.dentalstack.doctor.enums.user.CountryCode;
import java.time.ZonedDateTime;
import java.util.List;

public interface DoctorInvitationSummary {
    // Personal Details
    String getFirstName();

    String getLastName();

    String getEmail();

    String getMobileNo();

    String getSalutation();

    // Country and Registration Details
    CountryCode getCountryCode();

    UserRegistrationType getRegistrationType();

    // Invitation Details
    Long getInvitationId();

    List<InvitationRole> getInvitationRole();

    String getInvitationCode();

    InvitationStatus getStatus();

    ZonedDateTime getInvitedAt();

    ZonedDateTime getLastInvitationAt();

    ZonedDateTime getExpiresAt();

    ZonedDateTime getAcceptedAt();

    // Organization Details
    Long getOrganizationId();

    String getOrganizationName();

    String getOrganizationProfileUrl();

    Long getOrganizationProfileImageId();

    // Doctor Details
    Long getDoctorId();

    String getProfileUrl();

    Long getProfileImageId();

    // Invitation Counts
    Long getActiveInvitationsCount();

    Long getPendingInvitationsCount();
}
