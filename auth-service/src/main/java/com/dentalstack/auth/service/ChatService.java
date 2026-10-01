package com.dentalstack.auth.service;

import com.dentalstack.auth.dto.email.EmailSendReq;
import com.dentalstack.auth.dto.email.OtpSendOnEmailRequest;
import com.dentalstack.auth.dto.otp.OTPDetailsDTO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;

public interface ChatService {

    String sendPasswordResetConfirmationMail(@Valid @RequestBody EmailSendReq emailSendReq);

    String sendOTP(@Valid @RequestBody OTPDetailsDTO oTPDetailsDTO);

    String sendOtpOnMail(@Valid @RequestBody OtpSendOnEmailRequest otpSendOnEmailRequest);

    String sendOtpOnMailPatient(@Valid @RequestBody OtpSendOnEmailRequest otpSendOnEmailRequest);

    String sendPasswordResetConfirmationMailToPatient(@Valid @RequestBody EmailSendReq emailSendReq);
}
