package com.dentalstack.patient.feature.aligner.exception.aligner;

public class AlignerJourneyCreationNotCompleteException extends RuntimeException {
    public AlignerJourneyCreationNotCompleteException(Long alignerJourneyId) {
        super(String.format("Creation of aligner journey with id %d is not complete", alignerJourneyId));
    }
}
