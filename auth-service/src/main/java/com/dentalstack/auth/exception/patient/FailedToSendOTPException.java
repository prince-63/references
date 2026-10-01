package com.dentalstack.auth.exception.patient;

import static com.dentalstack.auth.exception.BusinessErrorCode.FAILED_TO_SEND_OTP;

import com.dentalstack.auth.exception.BusinessException;

public class FailedToSendOTPException extends BusinessException {
    public FailedToSendOTPException(String mobileNo) {
        super(FAILED_TO_SEND_OTP, String.format("Failed to send OTP on mobile no %s", mobileNo));
    }
}
