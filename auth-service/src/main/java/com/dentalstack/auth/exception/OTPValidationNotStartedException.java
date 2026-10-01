package com.dentalstack.auth.exception;

import static com.dentalstack.auth.exception.BusinessErrorCode.OTP_NOT_SENT;

import com.dentalstack.auth.enums.patient.UserType;

public class OTPValidationNotStartedException extends BusinessException {
    public OTPValidationNotStartedException(String mobileNo, UserType userType) {
        super(OTP_NOT_SENT, String.format("OTP not sent to %s with mobile no %s", userType, mobileNo));
    }
}
