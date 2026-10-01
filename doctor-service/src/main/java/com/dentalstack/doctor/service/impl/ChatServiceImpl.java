package com.dentalstack.doctor.service.impl;

import com.dentalstack.doctor.client.ChatServiceClient;
import com.dentalstack.doctor.dto.mail.doctorinvitation.DoctorInvitationEmailRequest;
import com.dentalstack.doctor.dto.mail.doctorinvitation.VspCustomerInvitationEmailRequest;
import com.dentalstack.doctor.dto.mail.doctorinvitation.VspCustomerSignedUpEmailRequest;
import com.dentalstack.doctor.dto.mail.welcome.WelcomeEmailRequest;
import com.dentalstack.doctor.dto.notification.SendNotificationRequest;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.patient.Patient;
import com.dentalstack.doctor.entity.user.Role;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.repository.patient.PatientRepository;
import com.dentalstack.doctor.service.ChatService;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ChatServiceClient chatServiceClient;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public void inviteToAllUsersExceptPractice(DoctorInvitationEmailRequest request) {
        try {
            chatServiceClient.inviteToAllUsersExceptPractice(request);
        } catch (Exception e) {
            log.error("Failed to send inviteToAllUsersExceptPractice for request: {}", request, e);
        }
    }

    @Override
    public void sendVspCustomerInvitationEmail(VspCustomerInvitationEmailRequest request) {
        try {
            chatServiceClient.sendVspCustomerInvitationEmail(request);
        } catch (Exception e) {
            log.error("Failed to send sendVspCustomerInvitationEmail for request: {}", request, e);
        }
    }

    @Override
    public void sendVspCustomerSignedUpEmail(VspCustomerSignedUpEmailRequest request) {
        try {
            chatServiceClient.sendVspCustomerSignedUpEmail(request);
        } catch (Exception e) {
            log.error("Failed to send sendVspCustomerSignedUpEmail for request: {}", request, e);
        }
    }

    @Override
    public void sendWelcomeMailToUser(WelcomeEmailRequest request) {
        try {
            chatServiceClient.sendWelcomeMailToUser(request);
        } catch (Exception e) {
            log.error("Failed to send sendWelcomeMailToUser for request: {}", request, e);
        }
    }

    @Override
    public void sendNotification(SendNotificationRequest request) {
        StringBuilder doctorRole = new StringBuilder();

        try {
            try {
                if (request.getPatientId() != null) {
                    Patient patient = patientRepository.findByPatientId(request.getPatientId());
                    Doctor doctor = doctorRepository.findAddedByUser(patient.getAddedByUserId());

                    if (doctor != null) {
                        UserProfile doctorProfile = doctor.getPrimaryUserProfile();

                        if (doctorProfile.getRoles() != null
                                && !doctorProfile.getRoles().isEmpty()) {
                            String roles = doctorProfile.getRoles().stream()
                                    .map(Role::getName)
                                    .collect(Collectors.joining("|"));
                            doctorRole.append(roles);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error while fetching doctor role for patientId: {}", request.getPatientId(), e);
            }

            if (request.getDoctorRole() == null) {
                request.setDoctorRole(doctorRole.toString());
            }

            chatServiceClient.sendNotification(request);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }
}
