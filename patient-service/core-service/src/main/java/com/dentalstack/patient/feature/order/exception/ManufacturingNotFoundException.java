package com.dentalstack.patient.feature.order.exception;

import static com.dentalstack.patient.global.exception.BusinessErrorCode.MANUFACTURING_NOT_FOUND;

import com.dentalstack.patient.global.exception.BusinessException;

public class ManufacturingNotFoundException extends BusinessException {
    public ManufacturingNotFoundException(Long manufacturingId) {
        super(MANUFACTURING_NOT_FOUND, "Manufacturing not found with ID: " + manufacturingId);
    }
}
