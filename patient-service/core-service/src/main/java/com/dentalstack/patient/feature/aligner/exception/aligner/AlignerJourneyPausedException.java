package com.dentalstack.patient.feature.aligner.exception.aligner;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AlignerJourneyPausedException extends BusinessException {

    public AlignerJourneyPausedException(long alignerJourneyId) {
        super(
                BusinessErrorCode.PAUSED_ALIGNER_JOURNEY_FOUND,
                String.format(
                        "Aligner journey with id %s is paused. Resume the aligner journey to proceed.",
                        alignerJourneyId));
    }
}
