package com.dentalstack.patient.feature.treatment.exception;

public class AlignersNotSetForAlignerJourneyException extends RuntimeException {
    public AlignersNotSetForAlignerJourneyException(Long alignerJourneyId) {
        super(String.format("Aligners not set for aligner journey id %d", alignerJourneyId));
    }
}
