package com.dentalstack.patient.feature.notification.service.impl;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.doctor.repository.DoctorRepository;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationEmailRequest;
import com.dentalstack.patient.feature.notification.client.ChatServiceClient;
import com.dentalstack.patient.feature.notification.dto.*;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.projection.LiveActivitySummary;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionEmailRequest;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import jakarta.validation.Valid;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

@Service
@Slf4j
@RequiredArgsConstructor
@Profile("prod | stage | local")
public class ChatServiceImpl implements ChatService {

    private final ChatServiceClient chatServiceClient;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final XOrganizationNameResolver xOrgNameResolver;

    @Override
    @Transactional
    public void sendNotification(@Valid @RequestBody SendNotificationRequest request) {
        String doctorRole = "";
        try {
            if (Boolean.TRUE.equals(request.getIsDoctorApp())) {
                doctorRole = fetchUserRolesByEmail(request.getEmail());
            } else if (request.getPatientId() != null) {
                doctorRole = fetchDoctorRolesByPatientId(request.getPatientId());
            }
            request.setDoctorRole(doctorRole);
            chatServiceClient.sendNotification(request);
        } catch (Exception e) {
            log.error("Failed to send notification msg: '{}' to '{}'", request.getMessage(), request.getMobile(), e);
        }
    }

    private String fetchDoctorRolesByPatientId(Long patientId) {
        try {
            Patient patient = patientRepository.findByPatientId(patientId);
            if (patient == null) {
                return "";
            }
            Doctor doctor = doctorRepository.findAddedByUser(patient.getAddedByUserId());
            if (doctor == null || doctor.getPrimaryUserProfile() == null) {
                return "";
            }
            return extractRolesAsString(doctor.getPrimaryUserProfile().getRoles());
        } catch (Exception e) {
            return "";
        }
    }

    private String fetchUserRolesByEmail(String email) {
        try {
            if (email == null || email.isBlank()) {
                return "";
            }
            List<UserProfile> userProfiles = userProfileRepository.findByEmail(email);
            if (userProfiles.isEmpty()) {
                return "";
            }
            UserProfile userProfile = userProfiles.get(0);
            return extractRolesAsString(userProfile.getRoles());
        } catch (Exception e) {
            return "";
        }
    }

    private String extractRolesAsString(Collection<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return "";
        }
        return roles.stream().map(Role::getName).filter(Objects::nonNull).collect(Collectors.joining("|"));
    }

    @Override
    public void inviteToNonExistingPatient(@RequestBody @Valid SmsToDoctor smsToDoctor) {
        try {
            chatServiceClient.inviteToNonExistingPatient(smsToDoctor);
        } catch (Exception e) {
            log.error("Failed to send invite to non-existing patient. Error: {}", e.getMessage());
        }
    }

    @Override
    public void generateSampleChats(GenerateSampleChatRequest request) {
        try {
            chatServiceClient.generateSampleChats(request);
        } catch (Exception e) {
            log.error("Failed to generate sample chats. Error: {}", e.getMessage());
        }
    }

    @Override
    public void sendAlignerDetailsReceivedEmail(
            @Valid @RequestBody AlignerDetailsReceivedReq alignerDetailsReceivedReq) {
        try {
            chatServiceClient.sendAlignerDetailsReceivedEmail(alignerDetailsReceivedReq);
        } catch (Exception e) {
            log.error("Failed to send aligner details received email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void sendMissedAlignerChangeSMSToDoctor(Patient patient, DoctorDetails doctor) {
        try {
            chatServiceClient.sendMissedAlignerChangeSMSToDoctor(SmsToDoctor.builder()
                    .mobile(doctor.getMobile())
                    .patientName(patient.getFirstName())
                    .doctorName(doctor.getFirstName())
                    .build());
        } catch (Exception e) {
            log.error("Failed to send missed aligner change SMS to doctor. Error: {}", e.getMessage());
        }
    }

    @Override
    public void smsForAlignerChangeAlert(SmsToDoctor smsToDoctor) {
        try {
            chatServiceClient.smsForAlignerChangeAlert(smsToDoctor);
        } catch (Exception e) {
            log.error("Failed to send aligner change alert SMS. Error: {}", e.getMessage());
        }
    }

    @Override
    public void sendSmsToDoctorForAlignerDetailsFilledByPatient(SmsToDoctor smsToDoctor) {
        try {
            chatServiceClient.sendSmsToDoctorForAlignerDetailsFilledByPatient(smsToDoctor);
        } catch (Exception e) {
            log.error("Failed to send SMS to doctor for aligner details filled by patient. Error: {}", e.getMessage());
        }
    }

    @Override
    public void sendPatientInvitationSms(InvitationRequest request) {
        try {
            chatServiceClient.sendPatientInvitationSms(request);
        } catch (Exception e) {
            log.error("Failed to send patient invitation SMS. Error: {}", e.getMessage());
        }
    }

    @Override
    public void sendInvitation(InvitationRequest request) {
        try {
            chatServiceClient.sendInvitation(request);
        } catch (Exception e) {
            log.error("Failed to send invitation. Error: {}", e.getMessage());
        }
    }

    @Override
    public void deleteByPatientId(Long patientId) {
        try {
            chatServiceClient.deleteByPatientId(patientId);
        } catch (Exception e) {
            log.error("Failed to delete chat for patient id: {}. Error: {}", patientId, e.getMessage());
        }
    }

    @Override
    public void removeFilesAndImages(RemoveFilesAndImagesRequest request) {
        try {
            chatServiceClient.removeFilesAndImages(request);
        } catch (Exception e) {
            log.error("Failed to remove files and images. Error: {}", e.getMessage());
        }
    }

    @Override
    public void emailForDraftTreatmentSaved(@Valid @RequestBody EmailSendForPendingReq request) {
        try {
            chatServiceClient.emailForDraftTreatmentSaved(request);
        } catch (Exception e) {
            log.error("Failed to send email for draft treatment saved. Error: {}", e.getMessage());
        }
    }

    @Override
    public long getDoctorUnreadMessageCount(Long doctorId, @Valid @RequestBody List<Long> patientIds) {
        try {
            return chatServiceClient.getDoctorUnreadMessageCount(doctorId, patientIds);
        } catch (Exception e) {
            log.error(
                    "Failed to get doctor unread message count for doctorId: {}. Error: {}", doctorId, e.getMessage());
            return 0;
        }
    }

    @Override
    public void invitationAccepted(@Valid @RequestBody EmailSendReq request) {
        try {
            chatServiceClient.invitationAccepted(request);
        } catch (Exception e) {
            log.error("Failed to send invitation accepted email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void newPatientAssignedToPractice(EmailSendReq request) {
        try {
            chatServiceClient.newPatientAssignedToPractice(request);
        } catch (Exception e) {
            log.error("Failed to send new patient assigned to practice email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void addedPatientByPracticeMail(EmailSendReq request) {
        try {
            chatServiceClient.addedPatientByPracticeMail(request);
        } catch (Exception e) {
            log.error("Failed to send added patient by practice mail. Error: {}", e.getMessage());
        }
    }

    @Override
    public void newPatientAssignedToPracticeNotification(
            String patientName, String email, String orgName, Long patientId) {
        sendNotification(SendNotificationRequest.builder()
                .title("New patient assigned")
                .message(String.format("%s has added a new patient.", orgName.trim()))
                .notificationIndex(107)
                .email(email)
                .isDoctorApp(true)
                .patientId(patientId)
                .xOrgName(xOrgNameResolver.resolveFromPatientId(patientId).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatientId(patientId).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForPatientAddedByPractice(String email, String displayName, Long patientId) {
        sendNotification(SendNotificationRequest.builder()
                .title("New patient added")
                .message(String.format("%s has added a new patient.", displayName.trim()))
                .notificationIndex(106)
                .email(email)
                .isDoctorApp(true)
                .patientId(patientId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patientId))
                .xOrgName(xOrgNameResolver.resolveFromPatientId(patientId).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatientId(patientId).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForLiveActivity() {
        int batchSize = 100;
        int pageNumber = 0;
        Page<LiveActivitySummary> page;

        do {
            Pageable pageable = PageRequest.of(pageNumber, batchSize);
            page = patientRepository.findAllPatientsWithEmail(pageable);

            for (LiveActivitySummary patient : page.getContent()) {
                sendNotification(SendNotificationRequest.builder()
                        .title("")
                        .message("")
                        .mobile("")
                        .notificationIndex(999)
                        .email(patient.getEmail())
                        .patientId(patient.getId())
                        .isDoctorApp(false)
                        .xOrgName(xOrgNameResolver
                                .resolveFromPatientId(patient.getId())
                                .getXOrgName())
                        .organizationId(xOrgNameResolver
                                .resolveFromPatientId(patient.getId())
                                .getOrganizationId())
                        .build());
            }

            pageNumber++;
            log.info("Processed batch {} with {} patients", pageNumber, page.getNumberOfElements());
        } while (page.hasNext());

        log.info("Completed sending notifications to all patients with email");
    }

    @Override
    public void trialPlanExpiring(SubscriptionEmailRequest request) {
        try {
            chatServiceClient.trialPlanExpiring(request);
        } catch (Exception e) {
            log.error("Failed to send trial plan expiring email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void trialPlanExpired(SubscriptionEmailRequest request) {
        try {
            chatServiceClient.trialPlanExpired(request);
        } catch (Exception e) {
            log.error("Failed to send trial plan expired email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void subscriptionUpgraded(SubscriptionEmailRequest request) {
        try {
            chatServiceClient.subscriptionUpgraded(request);
        } catch (Exception e) {
            log.error("Failed to send subscription upgraded email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void subscriptionPlanExpired(SubscriptionEmailRequest request) {
        try {
            chatServiceClient.subscriptionPlanExpired(request);
        } catch (Exception e) {
            log.error("Failed to send subscription plan expired email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void paidPlanRenewal(SubscriptionEmailRequest request) {
        try {
            chatServiceClient.paidPlanRenewal(request);
        } catch (Exception e) {
            log.error("Failed to send paid plan renewal email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void topUpSuccess(SubscriptionEmailRequest request) {
        try {
            chatServiceClient.topUpSuccess(request);
        } catch (Exception e) {
            log.error("Failed to send top up success email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void treatmentApprovedByPatient(EmailSendReq request) {
        try {
            chatServiceClient.treatmentApprovedByPatient(request);
        } catch (Exception e) {
            log.error("Failed to send treatment approved by patient email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void treatmentPlanFinalizedByPractice(EmailSendReq request) {
        try {
            chatServiceClient.treatmentPlanFinalizedByPractice(request);
        } catch (Exception e) {
            log.error("Failed to send treatment plan finalized by practice email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void shippingDetailsAdded(EmailSendReq request) {
        try {
            chatServiceClient.shippingDetailsAdded(request);
        } catch (Exception e) {
            log.error("Failed to send shipping details added email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void orderSend(OrderManagementEmailRequest request) {
        try {
            chatServiceClient.orderSend(request);
        } catch (Exception e) {
            log.error("Failed to send order email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void requestedNeedMoreInfo(OrderManagementEmailRequest request) {
        try {
            chatServiceClient.requestedNeedMoreInfo(request);
        } catch (Exception e) {
            log.error("Failed to send need more info email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void sendTreatmentForReviewEmail(OrderManagementEmailRequest request) {
        try {
            chatServiceClient.sendTreatmentForReviewEmail(request);
        } catch (Exception e) {
            log.error("Failed to send treatment for review email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void requestToRePlan(OrderManagementEmailRequest request) {
        try {
            chatServiceClient.requestToUpdatePlan(request);
        } catch (Exception e) {
            log.error("Failed to send request to replan email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void sendWelcomeMailToUser(WelcomeEmailRequest request) {
        try {
            chatServiceClient.sendWelcomeMailToUser(request);
        } catch (Exception e) {
            log.error("Failed to send welcome mail to user. Error: {}", e.getMessage());
        }
    }

    @Override
    public void requestForStlFileEmail(OrderManagementEmailRequest request) {
        try {
            chatServiceClient.requestForStlFileEmail(request);
        } catch (Exception e) {
            log.error("Failed to send request for STL file email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void stlFileUploadedEmail(OrderManagementEmailRequest request) {
        try {
            chatServiceClient.stlFileUploadedEmail(request);
        } catch (Exception e) {
            log.error("Failed to send STL file uploaded email. Error: {}", e.getMessage());
        }
    }

    @Override
    public void sendWhatsAppMessage(WhatsAppRequest request) {
        try {
            chatServiceClient.sendWhatsAppMessage(request);
        } catch (Exception e) {
            log.error("Failed to send WhatsApp message. Error: {}", e.getMessage());
        }
    }

    @Override
    public void inviteToAllUsersExceptPractice(DoctorInvitationEmailRequest request) {
        try {
            chatServiceClient.inviteToAllUsersExceptPractice(request);
        } catch (Exception e) {
            log.error("Failed to send invitation to all users except practice. Error: {}", e.getMessage());
        }
    }

    @Override
    public void addChatEvent(AddChatRequest request) {
        try {
            chatServiceClient.addChatEvent(request);
        } catch (Exception e) {
            log.error("Failed to add chat event. Error: {}", e.getMessage());
        }
    }
}
