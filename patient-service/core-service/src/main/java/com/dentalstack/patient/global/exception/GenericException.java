package com.dentalstack.patient.global.exception;

import static com.dentalstack.patient.global.exception.BusinessErrorCode.GENERIC_EXCEPTION;

public class GenericException extends BusinessException {
    public GenericException(String message) {
        super(GENERIC_EXCEPTION, message);
    }
}
