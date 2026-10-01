package com.dentalstack.patient.feature.aligner.projection;

import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import java.time.LocalDate;
import java.time.ZonedDateTime;

public interface BracesJourneySummary {
    Long getPatientId();

    BracesTreatmentStage getBracesTreatmentStage();

    Integer getAppointmentCount();

    Long getDoctorId();

    ZonedDateTime getCreatedAt();

    Boolean getHasAppointments();

    String getEmail();

    String getMobile();

    String getFullName();

    String getCustomPatientId();

    String getPracticeLocationName();

    Long getPracticeLocationId();

    InvitationStatus getInvitationStatus();

    Boolean getIsInvitationSent();

    String getTreatmentType();

    String getTreatmentStage();

    LocalDate getDoctorTreatmentStartDate();

    String getBrandName();

    CountryCode getCountryCode();
}
