package com.dentalstack.patient.feature.tracking.projection;

import com.dentalstack.patient.feature.tracking.enums.Status;
import java.time.LocalDate;

public interface TrackingSummary {
    String getReasonForPausing();

    LocalDate getPauseDate();

    Long getPatientId();

    Long getDoctorId();

    Status getStatus();

    LocalDate getResumeDate();

    Long getAlignerJourneyId();

    String getTrackingType();

    Boolean getAskPatientToFill();

    String getPatientDataFillStatus();

    Boolean getSendToPatient();
}
