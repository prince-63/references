package com.dentalstack.patient.feature.invitation.projection;

import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.patient.enums.LeadTreatmentStage;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public interface WebLeadDetailsSummary {
    Long getAlignerJourneyId();

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

    ZonedDateTime getInvitedAt();

    String getInviteCode();

    Long getPatientId();

    String getFirstName();

    String getLastName();

    String getPracticeLocationName();

    Long getPracticeLocationId();

    String getEmail();

    String getMobileNo();

    Integer getAge();

    String getGender();

    String getCustomerMappedId();

    List<String> getProductTypeNames();

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

    String getUUID();

    String getChiefComplaint();

    CountryCode getCountryCode();

    PatientStatus getPatientStatus();

    Long getAddedByUserId();

    PatientBelongsTo getPatientBelongsTo();

    Boolean getIsPracticeAssigned();

    Long getPracticeDoctorId();

    Long getPracticeProfileId();

    Long getPracticeOrganizationId();

    String getPracticeDisplayName();

    LeadTreatmentStage getTreatmentStage();

    LocalDate getDoctorTreatmentStartDate();

    Long getAddedByUserProfileId();

    LocalDateTime getCreatedAt();

    String getTreatmentType();

    String getFullName();

    Long getDoctorId();

    String getBrandName();

    Long getTreatmentPlanId();
}
