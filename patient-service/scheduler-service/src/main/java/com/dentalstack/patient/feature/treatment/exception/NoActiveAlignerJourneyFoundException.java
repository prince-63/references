package com.dentalstack.patient.feature.treatment.exception;

public class NoActiveAlignerJourneyFoundException extends RuntimeException {
    public NoActiveAlignerJourneyFoundException(String msg) {
        super(msg);
    }

    public static NoActiveAlignerJourneyFoundException ofId(long alignerJourneyId) {
        return new NoActiveAlignerJourneyFoundException(
                String.format("No active aligner journey with id %d", alignerJourneyId));
    }

    public static NoActiveAlignerJourneyFoundException ofPatientId(long patientId) {
        return new NoActiveAlignerJourneyFoundException(
                String.format("No active aligner journey found for patient %d", patientId));
    }
}
