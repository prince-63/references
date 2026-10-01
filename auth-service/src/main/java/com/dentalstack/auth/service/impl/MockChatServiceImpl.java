package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.dto.email.EmailSendReq;
import com.dentalstack.auth.dto.email.OtpSendOnEmailRequest;
import com.dentalstack.auth.dto.otp.OTPDetailsDTO;
import com.dentalstack.auth.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@Profile("local")
public class MockChatServiceImpl implements ChatService {
    @Override
    public String sendPasswordResetConfirmationMail(EmailSendReq emailSendReq) {
        return "Email sent";
    }

    @Override
    public String sendOTP(OTPDetailsDTO otpDetails) {
        return "OTP sent,";
    }

    @Override
    public String sendOtpOnMail(OtpSendOnEmailRequest otpSendOnEmailRequest) {
        return "Otp send";
    }

    public String sendOtpOnMailPatient(OtpSendOnEmailRequest otpSendOnEmailRequest) {
        return "Otp send";
    }

    @Override
    public String sendPasswordResetConfirmationMailToPatient(EmailSendReq emailSendReq) {
        return "Email sent";
    }
}
