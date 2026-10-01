package com.dentalstack.auth.exception.doctor;

import com.dentalstack.auth.exception.BusinessErrorCode;
import com.dentalstack.auth.exception.BusinessException;

public class FailedToResetDoctorPasswordException extends BusinessException {
    public FailedToResetDoctorPasswordException(String mobileNo) {
        super(
                BusinessErrorCode.FAILED_TO_RESET_PASSWORD,
                String.format("Failed to reset password of doctor with mobile no %s", mobileNo));
    }
}
