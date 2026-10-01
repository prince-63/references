package com.dentalstack.patient.feature.vsp.projection;

import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

public interface VspPatientListSummary {
    Long getPatientId();

    String getFirstName();

    String getLastName();

    String getFullName();

    String getEmail();

    String getMobileNo();

    String getProfilePictureUrl();

    String getCustomerMappedId();

    Long getPracticeLocationId();

    String getPracticeLocationName();

    CountryCode getCountryCode();

    LocalDateTime getCreatedAt();

    ZonedDateTime getPatientUpdatedAt();

    String getLatestVspOrderId();

    String getProductName();

    String getCaseType();

    VspOrderStatus getVspOrderStatus();

    LocalDateTime getVspOrderUpdatedAt();

    LocalDateTime getLastUpdated();
}
