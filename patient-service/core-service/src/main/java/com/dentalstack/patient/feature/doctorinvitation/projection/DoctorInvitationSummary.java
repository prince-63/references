package com.dentalstack.patient.feature.doctorinvitation.projection;

import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationRole;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.doctorinvitation.enums.UserRegistrationType;
import com.dentalstack.patient.global.enums.CountryCode;
import java.time.ZonedDateTime;
import java.util.List;

public interface DoctorInvitationSummary {

    String getFirstName();

    String getLastName();

    String getEmail();

    String getMobileNo();

    String getSalutation();

    CountryCode getCountryCode();

    UserRegistrationType getRegistrationType();

    Long getInvitationId();

    List<InvitationRole> getInvitationRole();

    String getInvitationCode();

    InvitationStatus getStatus();

    ZonedDateTime getInvitedAt();

    ZonedDateTime getLastInvitationAt();

    ZonedDateTime getExpiresAt();

    ZonedDateTime getAcceptedAt();

    Long getOrganizationId();

    String getOrganizationName();

    String getOrganizationProfileUrl();

    Long getDoctorId();

    String getProfileUrl();

    Long getActiveInvitationsCount();

    Long getPendingInvitationsCount();
}
