package com.dentalstack.patient.feature.tracking.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class SomePatientAlreadyHaveTrackingEnabledException extends BusinessException {
    public SomePatientAlreadyHaveTrackingEnabledException(long customerId) {
        super(
                BusinessErrorCode.CUSTOMER_PATIENT_TRACKING_ENABLED,
                String.format("Customer patient tracking is already enabled for customer id %d", customerId));
    }
}
