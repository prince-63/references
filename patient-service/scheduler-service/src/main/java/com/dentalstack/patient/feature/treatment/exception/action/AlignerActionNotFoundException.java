package com.dentalstack.patient.feature.treatment.exception.action;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AlignerActionNotFoundException extends BusinessException {
    public AlignerActionNotFoundException(long alignerActionId) {
        super(
                BusinessErrorCode.ALIGNER_ACTION_NOT_FOUND,
                String.format("Aligner action not found with id %d", alignerActionId));
    }

    public AlignerActionNotFoundException() {
        super(BusinessErrorCode.ALIGNER_ACTION_NOT_FOUND, "Aligner action not found");
    }
}
