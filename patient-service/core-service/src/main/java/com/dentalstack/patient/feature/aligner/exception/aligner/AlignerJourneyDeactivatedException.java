package com.dentalstack.patient.feature.aligner.exception.aligner;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AlignerJourneyDeactivatedException extends BusinessException {
    public AlignerJourneyDeactivatedException(Long alignerJourneyId) {
        super(
                BusinessErrorCode.ALIGNER_JOURNEY_DEACTIVATED,
                String.format(
                        "The requested action cannot be performed because the aligner journey has been deactivated. Id: %d",
                        alignerJourneyId));
    }
}
