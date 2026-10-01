package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.application.client.ChatServiceClient;
import com.dentalstack.patient.feature.notification.dto.EmailSendReq;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.UnprocessedAlignerDue;
import com.dentalstack.patient.feature.patient.projection.LiveActivitySummary;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.subscription.dto.SubscriptionEmailRequest;
import com.dentalstack.patient.feature.whatsapp.dto.WhatsAppRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
@Slf4j
@RequiredArgsConstructor
@Profile("prod | stage | local")
public class ChatServiceImpl implements ChatService {

    private final ChatServiceClient chatServiceClient;
    private final PatientRepository patientRepository;

    @Override
    public void sendNotification(@Valid @RequestBody SendNotificationRequest request) {
        try {
            chatServiceClient.sendNotification(request);
        } catch (Exception e) {
            log.error("Failed to send notification msg: {} to {}", request.getMessage(), request.getMobile());
        }
    }

    @Override
    public void newPatientAssignedToPractice(EmailSendReq request) {
        chatServiceClient.newPatientAssignedToPractice(request);
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
                        .build());
            }

            pageNumber++;
            log.info("Processed batch {} with {} patients", pageNumber, page.getNumberOfElements());
        } while (page.hasNext());

        log.info("Completed sending notifications to all patients with email");
    }

    @Override
    public void trialPlanExpiring(SubscriptionEmailRequest request) {
        chatServiceClient.trialPlanExpiring(request);
    }

    @Override
    public void trialPlanExpired(SubscriptionEmailRequest request) {
        chatServiceClient.trialPlanExpired(request);
    }

    @Override
    public void subscriptionPlanExpired(SubscriptionEmailRequest request) {
        chatServiceClient.subscriptionPlanExpired(request);
    }

    @Override
    public void paidPlanRenewal(SubscriptionEmailRequest request) {
        chatServiceClient.paidPlanRenewal(request);
    }

    @Override
    public void sendWhatsAppMessage(WhatsAppRequest request) {
        chatServiceClient.sendWhatsAppMessage(request);
    }

    @Override
    public void unprocessedDue(@Valid @RequestBody UnprocessedAlignerDue request) {
        chatServiceClient.unprocessedDue(request);
    }
}
