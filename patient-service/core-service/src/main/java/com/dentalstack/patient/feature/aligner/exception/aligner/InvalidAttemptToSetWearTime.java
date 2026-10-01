package com.dentalstack.patient.feature.aligner.exception.aligner;

import java.time.LocalDate;

public class InvalidAttemptToSetWearTime extends RuntimeException {
    public InvalidAttemptToSetWearTime(long patientId, Long alignerJourneyId, LocalDate treatmentStartDate) {
        super(String.format(
                "Patient %d cannot set wear time of aligner journey %s before its start date %s",
                patientId, alignerJourneyId, treatmentStartDate));
    }
}
