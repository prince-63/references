package com.dentalstack.patient.feature.smartbox.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class SmartBoxException extends BusinessException {
    public SmartBoxException(String message) {
        super(BusinessErrorCode.SMART_BOX_EXCEPTION, message);
    }
}
