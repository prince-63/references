package com.dentalstack.patient.feature.billing.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class PaymentNotFoundException extends BusinessException {
    public PaymentNotFoundException(long paymentId) {
        super(BusinessErrorCode.PAYMENT_NOT_FOUND, String.format("No payment found with id %s", paymentId));
    }
}
