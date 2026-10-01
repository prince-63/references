package com.dentalstack.patient.global.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;

public class BadRequestException extends BusinessException {
    public BadRequestException(String s) {
        super(BusinessErrorCode.BAD_REQUEST, s);
    }
}
