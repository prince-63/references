package com.dentalstack.patient.global.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    protected final String message;
    protected final BusinessErrorCode errorCode;

    public BusinessException(BusinessErrorCode businessErrorCode, String message) {
        super(businessErrorCode.name());
        this.message = message;
        this.errorCode = businessErrorCode;
    }
}
