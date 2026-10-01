package com.dentalstack.auth.service;

import com.dentalstack.auth.dto.doctor.DoctorDetails;
import com.dentalstack.auth.dto.doctor.ResetPasswordResponse;
import com.dentalstack.auth.dto.doctor.SendResetPasswordOTPRequest;
import com.dentalstack.auth.dto.doctor.SignUpDoctor;
import com.dentalstack.auth.dto.doctor.invitation.DoctorInvitationAcceptRequest;
import java.util.List;
import java.util.Map;

public interface DoctorService {

    DoctorDetails signUpDoctor(SignUpDoctor signUpDoctorRequest);

    DoctorDetails getDoctor(String emailId);

    DoctorDetails getDoctor(String emailId, Long organizationId, String xOrgName);

    ResetPasswordResponse resetPassword(SendResetPasswordOTPRequest sendResetPasswordOTPRequest);

    DoctorDetails acceptInvitation(DoctorInvitationAcceptRequest request);

    Map<String, DoctorDetails> getDoctorsByEmails(List<String> emails);
}
