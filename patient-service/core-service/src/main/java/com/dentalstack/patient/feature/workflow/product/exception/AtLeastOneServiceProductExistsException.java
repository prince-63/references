package com.dentalstack.patient.feature.workflow.product.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AtLeastOneServiceProductExistsException extends BusinessException {
    public AtLeastOneServiceProductExistsException(String message) {
        super(BusinessErrorCode.SERVICE_PRODUCT_DELETE, message);
    }
}
