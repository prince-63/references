package com.dentalstack.patient.feature.patient.projection;

import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerTreatmentStage;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.patient.enums.PatientType;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

public interface CombinedPatientSummary {
    Long getAlignerJourneyId();

    Long getPatientId();

    String getFirstName();

    String getAddedByFirstName();

    String getAddedByLastName();

    String getAddedBySalutation();

    String getAddedByUserProfileUrl();

    String getLastName();

    String getEmail();

    String getMobile();

    String getCustomPatientId();

    String getPracticeLocationName();

    Long getPracticeLocationId();

    ZonedDateTime getAddedOn();

    Integer getAge();

    String getGender();

    List<String> getProductTypeNames();

    Long getPracticeDoctorId();

    Long getPracticeProfileId();

    Long getPracticeOrganizationId();

    String getPracticeName();

    PatientType getPatientType();

    Boolean getHasReadExistingPatientForm();

    Boolean getIsYouPatient();

    LocalDateTime getResentInviteAt();

    Long getCurrentStep();

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

    String getProfilePictureUrl();

    Long getProfilePictureId();

    String getUUID();

    String getChiefComplaint();

    CountryCode getCountryCode();

    Long getAddedByUserId();

    Long getInvitationId();

    Short getInvitationStatus();

    default InvitationStatus getMappedInvitationStatus() {
        Short statusIndex = getInvitationStatus();
        if (statusIndex == null || statusIndex < 0 || statusIndex >= InvitationStatus.values().length) {
            return null;
        }
        return InvitationStatus.values()[statusIndex];
    }

    Boolean getIsInvitationSent();

    LocalDateTime getInvitedAt();

    String getInviteCode();

    String getBrandName();

    LocalDate getTreatmentStartDate();

    AlignerTreatmentStatus getTrackingStatus();

    String getBracesTreatmentStage();

    AlignerTreatmentStage getTreatmentStage();

    PatientBelongsTo getPatientBelongsTo();

    Long getDoctorId();

    String getFullName();

    String getTreatmentType();

    LocalDateTime getCreatedAt();

    String getCustomerMappedId();

    Long getTreatmentPlanId();

    LocalDateTime getArchivedAt();

    Boolean getIsTrackingEnabled();

    Boolean getIsStlFileViewEnabled();
}
