package com.dentalstack.patient.feature.doctor.projection;

import com.dentalstack.patient.feature.treatment.enums.BracesTreatmentStage;
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

    String getInvitationStatus();

    String getTreatmentType();

    String getTreatmentStage();

    LocalDate getDoctorTreatmentStartDate();

    String getBrandName();
}
