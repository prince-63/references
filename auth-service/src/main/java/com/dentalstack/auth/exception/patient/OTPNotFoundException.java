package com.dentalstack.auth.exception.patient;

import static com.dentalstack.auth.exception.BusinessErrorCode.OTP_NOT_SENT_TO_DOCTOR;

import com.dentalstack.auth.exception.BusinessException;

public class OTPNotFoundException extends BusinessException {
    public OTPNotFoundException(String mobileNo) {
        super(OTP_NOT_SENT_TO_DOCTOR, String.format("OTP not found sent to mobile no %s", mobileNo));
    }
}
