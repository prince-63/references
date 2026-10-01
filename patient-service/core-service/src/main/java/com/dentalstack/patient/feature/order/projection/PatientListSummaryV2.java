package com.dentalstack.patient.feature.order.projection;

import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

public interface PatientListSummaryV2 {
    Long getPatientId();

    String getFirstName();

    String getLastName();

    String getFullName();

    String getEmail();

    String getMobileNo();

    String getProfilePictureUrl();

    Long getProfileImageId();

    String getCustomerMappedId();

    Long getPracticeLocationId();

    String getPracticeLocationName();

    CountryCode getCountryCode();

    LocalDateTime getCreatedAt();

    ZonedDateTime getPatientUpdatedAt();

    String getLatestOrderId();

    String getProductName();

    String getCaseType();

    OrderStatus getOrderStatus();

    LocalDateTime getOrderUpdatedAt();

    LocalDateTime getLastUpdated();
}
