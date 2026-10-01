package com.dentalstack.patient.feature.patient.projection;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public interface ActivePatientSummary {
    Long getAlignerJourneyId();

    Long getPatientId();

    String getEmail();

    String getMobile();

    String getFullName();

    String getCustomPatientId();

    String getPracticeLocationName();

    Long getPracticeLocationId();

    Short getInvitationStatus();

    default InvitationStatus getMappedInvitationStatus() {
        Short statusIndex = getInvitationStatus();
        if (statusIndex == null || statusIndex < 0 || statusIndex >= InvitationStatus.values().length) {
            return null;
        }
        return InvitationStatus.values()[statusIndex];
    }

    Boolean getIsInvitationSent();

    String getTreatmentType();

    String getTreatmentStage();

    LocalDateTime getAddedOn();

    LocalDateTime getCreatedAt();

    AlignerTreatmentStatus getTrackingStatus();

    LocalDate getDoctorTreatmentStartDate();

    String getBrandName();

    CountryCode getCountryCode();

    String getProfilePictureUrl();

    PatientBelongsTo getPatientBelongsTo();

    Long getDoctorId();

    List<String> getProductTypeNames();

    Long getTreatmentPlanId();

    default List<String> getRawProductTypeNames() {
        List<String> productTypeNames = getProductTypeNames();

        if (productTypeNames == null || productTypeNames.isEmpty()) {
            return Collections.emptyList();
        }

        return productTypeNames.stream()
                .filter(Objects::nonNull)
                .flatMap(names -> Arrays.stream(names.split(",")))
                .map(String::trim)
                .map(name -> {
                    try {
                        return ProductTypeName.valueOf(name).name();
                    } catch (IllegalArgumentException e) {
                        return ProductTypeName.UNASSIGNED.name();
                    }
                })
                .collect(Collectors.toList());
    }
}
