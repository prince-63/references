package com.dentalstack.doctor.exception;

import static com.dentalstack.doctor.exception.BusinessErrorCode.GENERIC_EXCEPTION;

public class GenericException extends BusinessException {
    public GenericException(String message) {
        super(GENERIC_EXCEPTION, message);
    }
}
