package com.dentalstack.patient.global.exception;

public class BadRequestException extends BusinessException {
    public BadRequestException(String s) {
        super(BusinessErrorCode.BAD_REQUEST, s);
    }
}
