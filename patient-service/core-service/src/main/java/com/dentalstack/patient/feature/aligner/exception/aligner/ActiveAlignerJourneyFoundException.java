package com.dentalstack.patient.feature.aligner.exception.aligner;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class ActiveAlignerJourneyFoundException extends BusinessException {

    public ActiveAlignerJourneyFoundException(long treatmentPlanId) {
        super(
                BusinessErrorCode.ACTIVE_ALIGNER_JOURNEY_FOUND,
                String.format(
                        "Patient already has an active aligner journey with id : %s."
                                + " Complete or deactivate the existing treatment before creating a new one. ",
                        treatmentPlanId));
    }
}
