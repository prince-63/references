package com.dentalstack.patient.feature.aligner.exception.aligner.production.lab;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AlignerProductionLabNotFoundException extends BusinessException {

    public AlignerProductionLabNotFoundException(Long id) {
        super(
                BusinessErrorCode.ALIGNER_PRODUCTION_LAB_NOT_FOUND,
                String.format("Aligner production lab with id %s not found", id));
    }
}
