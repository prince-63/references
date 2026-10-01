package com.dentalstack.patient.feature.treatment.exception;

public class AlignerNotFoundException extends RuntimeException {
    public AlignerNotFoundException(Long alignerJourneyId, int srNo) {
        super(String.format("Aligner not found for journey %d with sr no %d", alignerJourneyId, srNo));
    }

    public AlignerNotFoundException(long alignerId) {
        super(String.format("Aligner not found with id %s", alignerId));
    }
}
