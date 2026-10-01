package com.dentalstack.patient.feature.workflow.product.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AtLeastOneServiceProductIsEnabledException extends BusinessException {

    public AtLeastOneServiceProductIsEnabledException(String message) {
        super(BusinessErrorCode.SERVICE_PRODUCT_ENABLE_CONSTRAINT_VIOLATION, message);
    }
}
