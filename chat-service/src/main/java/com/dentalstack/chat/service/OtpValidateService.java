package com.dentalstack.chat.service;

import com.dentalstack.chat.dto.email.OtpSendOnEmailRequest;
import com.dentalstack.chat.dto.otp.UpdateMobileNumberRequest;
import com.dentalstack.chat.entity.OtpTransactionMaster;

public interface OtpValidateService {
    String send(OtpTransactionMaster master);

    String sendOtpOnEmail(OtpSendOnEmailRequest otpTransactionMaster) throws Exception;

    boolean verificationOTP(OtpTransactionMaster master);

    boolean verifyPatientMobile(UpdateMobileNumberRequest otpTransactionMaster);
}
