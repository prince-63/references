package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.client.ChatServiceClient;
import com.dentalstack.auth.dto.email.EmailSendReq;
import com.dentalstack.auth.dto.email.OtpSendOnEmailRequest;
import com.dentalstack.auth.dto.otp.OTPDetailsDTO;
import com.dentalstack.auth.service.ChatService;
import feign.FeignException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@RequiredArgsConstructor
@Service
@Slf4j
@Profile("!local")
public class ChatServiceImpl implements ChatService {

    private final ChatServiceClient chatServiceClient;

    @Override
    public String sendPasswordResetConfirmationMail(@Valid @RequestBody EmailSendReq emailSendReq) {

        try {
            return chatServiceClient.sendPasswordResetConfirmationMail(emailSendReq);

        } catch (FeignException e) {
            log.error("Failed to send password reset confirmation mail: {}", e.getMessage(), e);

        } catch (Exception e) {
            log.error("Unexpected error while sending password reset confirmation mail: {}", e.getMessage(), e);
        }

        return "FAILED";
    }

    @Override
    public String sendOTP(@Valid @RequestBody OTPDetailsDTO oTPDetailsDTO) {

        try {
            return chatServiceClient.otpSend(oTPDetailsDTO);

        } catch (FeignException e) {
            log.error("Failed to send OTP: {}", e.getMessage(), e);

        } catch (Exception e) {
            log.error("Unexpected error while sending OTP: {}", e.getMessage(), e);
        }

        return "FAILED";
    }

    @Override
    public String sendOtpOnMail(@Valid @RequestBody OtpSendOnEmailRequest otpSendOnEmailRequest) {

        try {
            return chatServiceClient.sendOtpOnMail(otpSendOnEmailRequest);

        } catch (FeignException e) {
            log.error("Failed to send OTP on mail: {}", e.getMessage(), e);

        } catch (Exception e) {
            log.error("Unexpected error while sending OTP on mail: {}", e.getMessage(), e);
        }

        return "FAILED";
    }

    @Override
    public String sendOtpOnMailPatient(@Valid @RequestBody OtpSendOnEmailRequest otpSendOnEmailRequest) {

        try {
            return chatServiceClient.sendOtpOnMailToPatient(otpSendOnEmailRequest);

        } catch (FeignException e) {
            log.error("Failed to send OTP on mail to patient: {}", e.getMessage(), e);

        } catch (Exception e) {
            log.error("Unexpected error while sending OTP on mail to patient: {}", e.getMessage(), e);
        }

        return "FAILED";
    }

    @Override
    public String sendPasswordResetConfirmationMailToPatient(@Valid @RequestBody EmailSendReq emailSendReq) {

        try {
            return chatServiceClient.sendPasswordResetConfirmationMailToPatient(emailSendReq);

        } catch (FeignException e) {
            log.error("Failed to send password reset confirmation mail to patient: {}", e.getMessage(), e);

        } catch (Exception e) {
            log.error(
                    "Unexpected error while sending password reset confirmation mail to patient: {}",
                    e.getMessage(),
                    e);
        }

        return "FAILED";
    }
}
