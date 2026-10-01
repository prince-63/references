package com.dentalstack.patient.feature.treatment.exception.production;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class NoActiveAlignerProductionOrderFoundException extends BusinessException {
    public NoActiveAlignerProductionOrderFoundException(long alignerJourneyId) {
        super(
                BusinessErrorCode.NO_ACTIVE_ALIGNER_PRODUCTION_ORDER_FOUND,
                String.format(
                        "No active aligner production order found for aligner journey with id %s", alignerJourneyId));
    }
}
