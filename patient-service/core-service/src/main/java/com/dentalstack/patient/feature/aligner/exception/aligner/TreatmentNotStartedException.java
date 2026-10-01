package com.dentalstack.patient.feature.aligner.exception.aligner;

public class TreatmentNotStartedException extends RuntimeException {
    public TreatmentNotStartedException(Long alignerJourneyId) {
        super(String.format("Aligner journey %d is not started by the patient", alignerJourneyId));
    }
}
