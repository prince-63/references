package com.dentalstack.auth.exception.patient;

import static com.dentalstack.auth.exception.BusinessErrorCode.INVALID_OTP;

import com.dentalstack.auth.exception.BusinessException;

public class OTPValidationFailedException extends BusinessException {
    public OTPValidationFailedException(String mobileNo) {
        super(INVALID_OTP, String.format("Invalid OTP for mobile no %s", mobileNo));
    }
}
