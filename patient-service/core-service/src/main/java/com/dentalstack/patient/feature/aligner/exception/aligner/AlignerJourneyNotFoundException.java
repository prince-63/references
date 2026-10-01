package com.dentalstack.patient.feature.aligner.exception.aligner;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AlignerJourneyNotFoundException extends BusinessException {
    public AlignerJourneyNotFoundException(long alignerJourneyId) {
        super(
                BusinessErrorCode.ALIGNER_JOURNEY_NOT_FOUND,
                String.format("Aligner journey not found with id %d", alignerJourneyId));
    }

    public AlignerJourneyNotFoundException(String s) {
        super(BusinessErrorCode.ALIGNER_JOURNEY_NOT_FOUND, s);
    }

    public static AlignerJourneyNotFoundException ofPatientId(Long patientId) {
        return new AlignerJourneyNotFoundException(
                String.format("Aligner journey not found for patient %d", patientId));
    }
}
