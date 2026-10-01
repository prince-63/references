package com.dentalstack.patient.feature.search.projection;

import java.sql.Timestamp;

public interface GlobalSearchLeadProjection {
    Long getId();

    Long getPatientMappedId();

    Long getPatientId();

    Long getInvitationId();

    String getFirstName();

    String getLastName();

    String getEmail();

    String getMobile();

    String getCountryCode();

    String getPracticeLocation();

    String getProfileUrl();

    Long getProfileImageId();

    Long getVersion();

    Timestamp getCreatedAt();

    Timestamp getUpdatedAt();
}
