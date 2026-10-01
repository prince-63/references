package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.client.DoctorServiceClient;
import com.dentalstack.auth.dto.doctor.*;
import com.dentalstack.auth.dto.doctor.invitation.DoctorInvitationAcceptRequest;
import com.dentalstack.auth.exception.doctor.FailedToFetchDoctorDetailsException;
import com.dentalstack.auth.service.DoctorService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorServiceClient doctorServiceClient;

    @Override
    public DoctorDetails signUpDoctor(SignUpDoctor signUpDoctorRequest) {
        return doctorServiceClient.signUp(signUpDoctorRequest);
    }

    @Override
    public DoctorDetails getDoctor(String emailId) {
        try {
            return doctorServiceClient.getDoctor(emailId);
        } catch (Exception e) {
            throw new FailedToFetchDoctorDetailsException(emailId);
        }
    }

    @Override
    public DoctorDetails getDoctor(String emailId, Long organizationId, String xOrgName) {
        try {
            return doctorServiceClient.getDoctorDetails(emailId, organizationId, xOrgName);
        } catch (Exception e) {
            throw new FailedToFetchDoctorDetailsException(emailId);
        }
    }

    @Override
    public ResetPasswordResponse resetPassword(SendResetPasswordOTPRequest sendResetPasswordOTPRequest) {
        return doctorServiceClient.resetPassword(sendResetPasswordOTPRequest);
    }

    @Override
    public DoctorDetails acceptInvitation(DoctorInvitationAcceptRequest request) {
        return doctorServiceClient.acceptInvitation(request);
    }

    @Override
    public Map<String, DoctorDetails> getDoctorsByEmails(List<String> emails) {
        return doctorServiceClient.getDoctorsByEmails(emails);
    }
}
