package com.dentalstack.patient.feature.subcription.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class OrderLimitExceededException extends BusinessException {
    public OrderLimitExceededException() {
        super(BusinessErrorCode.ORDER_LIMIT_EXCEEDED, "Order limit exceeded");
    }
}
