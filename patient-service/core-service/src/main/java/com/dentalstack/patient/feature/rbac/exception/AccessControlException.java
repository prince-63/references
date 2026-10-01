package com.dentalstack.patient.feature.rbac.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AccessControlException extends BusinessException {
    public AccessControlException(String message) {
        super(BusinessErrorCode.ACCESS_CONTROL_EXCEPTION, message);
    }
}
