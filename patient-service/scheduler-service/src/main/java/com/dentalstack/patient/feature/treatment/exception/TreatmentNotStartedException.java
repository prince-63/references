package com.dentalstack.patient.feature.treatment.exception;

public class TreatmentNotStartedException extends RuntimeException {
    public TreatmentNotStartedException(Long alignerJourneyId) {
        super(String.format("Aligner journey %d is not started by the patient", alignerJourneyId));
    }
}
