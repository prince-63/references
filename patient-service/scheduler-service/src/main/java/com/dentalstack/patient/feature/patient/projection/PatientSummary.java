package com.dentalstack.patient.feature.patient.projection;

import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

public interface PatientSummary {
    Long getPatientId();

    String getFirstName();

    String getLastName();

    String getProfilePictureUrl();

    Boolean getIsTrackingAdded();

    BigDecimal getAmountDue();

    Long getPracticeLocationId();

    ZonedDateTime getCreatedAt();

    Long getDoctorId();

    @Enumerated(EnumType.STRING)
    List<ProductTypeName> getProductTypeNames();

    List<Treatment> getTreatments();

    String getPracticeLocationName();

    boolean getIsTreatmentAdded(); // New field

    String getMobileNumber();

    String getEmail();

    String getCity();

    String getUuid();

    Long getPracticeDoctorId();

    Long getPracticeProfileId();

    Long getPracticeOrganizationId();

    String getPracticeName();

    ProductTypeName getProductType();

    String getChiefComplaint();

    ZonedDateTime getArchivedAt();

    CountryCode getCountryCode();

    PatientStatus getPatientStatus();

    Long getAlignerJourneyId();
}
