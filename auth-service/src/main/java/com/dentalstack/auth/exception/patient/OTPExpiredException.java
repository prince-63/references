package com.dentalstack.auth.exception.patient;

import static com.dentalstack.auth.exception.BusinessErrorCode.OTP_EXPIRED;

import com.dentalstack.auth.exception.BusinessException;

public class OTPExpiredException extends BusinessException {
    public OTPExpiredException(String mobileNo) {
        super(OTP_EXPIRED, String.format("OTP sent to mobile no %s has expired", mobileNo));
    }
}
