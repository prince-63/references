package com.dentalstack.patient.feature.aligner.projection;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import java.time.LocalDate;

public interface AlignerJourneySummary {
    String getBrandName();

    Long alignerJourneyId();

    Long getAlignerJourneyId();

    Long getPatientId();

    LocalDate getDoctorTreatmentStartDate();

    AlignerTreatmentStatus getTrackingStatus();

    PatientStatus getPatientStatus();

    Integer getRefinementCount();
}
