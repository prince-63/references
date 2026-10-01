package com.dentalstack.patient.feature.treatment.exception.production.lab;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AlignerProductionAlreadyExistsException extends BusinessException {
    public AlignerProductionAlreadyExistsException(String name) {
        super(
                BusinessErrorCode.ALIGNER_PRODUCTION_ALREADY_EXISTS,
                String.format("Aligner production lab with name %s already exists", name));
    }
}
