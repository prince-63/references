package com.dentalstack.patient.feature.treatment.exception.production.lab;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AlignerProductionLabNotFoundException extends BusinessException {

    public AlignerProductionLabNotFoundException(Long id) {
        super(
                BusinessErrorCode.ALIGNER_PRODUCTION_LAB_NOT_FOUND,
                String.format("Aligner production lab with id %s not found", id));
    }
}
