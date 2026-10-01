package com.dentalstack.patient.feature.patient.projection;

import java.time.ZonedDateTime;

public interface LeadPatientSummary {
    Long getPatientId();

    String getEmail();

    String getMobile();

    String getFullName();

    String getCustomPatientId();

    String getPracticeLocationName();

    Long getPracticeLocationId();

    String getInvitationStatus();

    Boolean getIsInvitationSent();

    String getTreatmentType();

    String getTreatmentStage();

    ZonedDateTime getAddedOn();
}
