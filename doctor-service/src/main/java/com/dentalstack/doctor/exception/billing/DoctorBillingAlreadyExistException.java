package com.dentalstack.doctor.exception.billing;

import com.dentalstack.doctor.exception.BusinessErrorCode;
import com.dentalstack.doctor.exception.BusinessException;

public class DoctorBillingAlreadyExistException extends BusinessException {

    public DoctorBillingAlreadyExistException() {
        super(BusinessErrorCode.BILLING_ALREADY_PRESENT, "Doctor billing already present for this profile");
    }
}
