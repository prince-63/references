package com.dentalstack.patient.feature.subcription.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class SubscriptionNotFoundException extends BusinessException {

    public SubscriptionNotFoundException(long doctorId) {
        super(
                BusinessErrorCode.SUBSCRIPTION_NOT_FOUND,
                String.format("Subscription not found for this doctor %d", doctorId));
    }
}
