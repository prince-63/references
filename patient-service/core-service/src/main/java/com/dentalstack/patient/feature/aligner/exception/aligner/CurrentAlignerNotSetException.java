package com.dentalstack.patient.feature.aligner.exception.aligner;

public class CurrentAlignerNotSetException extends RuntimeException {
    public CurrentAlignerNotSetException(Long alignerJourneyId) {
        super(String.format("Current aligner is not set in journey %d", alignerJourneyId));
    }
}
