package com.dentalstack.patient.feature.aligner.exception.aligner;

public class AlignersNotSetForAlignerJourneyException extends RuntimeException {
    public AlignersNotSetForAlignerJourneyException(Long alignerJourneyId) {
        super(String.format("Aligners not set for aligner journey id %d", alignerJourneyId));
    }
}
