package com.dentalstack.doctor.exception.billing;

import com.dentalstack.doctor.exception.BusinessErrorCode;
import com.dentalstack.doctor.exception.BusinessException;

public class DoctorBillingNotFoundException extends BusinessException {

    public DoctorBillingNotFoundException(Long id) {
        super(BusinessErrorCode.BILLING_NOT_FOUND, String.format("Doctor billing not found with id %d", id));
    }
}
