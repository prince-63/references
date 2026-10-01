package com.dentalstack.auth.client;

import com.dentalstack.auth.dto.email.EmailSendReq;
import com.dentalstack.auth.dto.email.OtpSendOnEmailRequest;
import com.dentalstack.auth.dto.otp.OTPDetailsDTO;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "chat-service")
public interface ChatServiceClient {

    @PostMapping("/mail/password-reset-confirmation")
    String sendPasswordResetConfirmationMail(@Valid @RequestBody EmailSendReq emailSendReq);

    @PostMapping("/sms/v1/otp/send")
    String otpSend(@Valid @RequestBody OTPDetailsDTO oTPDetailsDTO);

    @PostMapping("/mail/otp-send-on-email")
    String sendOtpOnMail(@Valid @RequestBody OtpSendOnEmailRequest otpSendOnEmailRequest);

    @PostMapping("/mail/otp-send-on-email-patient")
    String sendOtpOnMailToPatient(@Valid @RequestBody OtpSendOnEmailRequest otpSendOnEmailRequest);

    @PostMapping("/mail/patient-password-reset-confirmation")
    String sendPasswordResetConfirmationMailToPatient(@Valid @RequestBody EmailSendReq emailSendReq);
}
