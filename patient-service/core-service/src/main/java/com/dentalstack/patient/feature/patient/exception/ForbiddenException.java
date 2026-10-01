package com.dentalstack.patient.feature.patient.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class ForbiddenException extends BusinessException {

    public ForbiddenException() {
        super(BusinessErrorCode.FORBIDDEN, "Access denied");
    }
}
