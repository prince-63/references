package com.dentalstack.patient.feature.patient.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class OwnerDoctorAccessDeniedException extends BusinessException {
    public OwnerDoctorAccessDeniedException() {
        super(BusinessErrorCode.OWNER_DOCTOR_ACCESS_DENIED, "Owner doctor access denied.");
    }
}
