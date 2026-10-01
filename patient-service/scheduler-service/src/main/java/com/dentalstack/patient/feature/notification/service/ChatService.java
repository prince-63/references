package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.feature.notification.dto.EmailSendReq;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.UnprocessedAlignerDue;
import com.dentalstack.patient.feature.subscription.dto.SubscriptionEmailRequest;
import com.dentalstack.patient.feature.whatsapp.dto.WhatsAppRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;

public interface ChatService {

    void sendNotification(SendNotificationRequest sendNotificationRequest);

    void newPatientAssignedToPractice(@Valid @RequestBody EmailSendReq request);

    void newPatientAssignedToPracticeNotification(String s, String email, String displayName, Long patientId);

    void notificationForLiveActivity();

    void trialPlanExpiring(@Valid @RequestBody SubscriptionEmailRequest request);

    void trialPlanExpired(SubscriptionEmailRequest request);

    void subscriptionPlanExpired(SubscriptionEmailRequest request);

    void paidPlanRenewal(SubscriptionEmailRequest request);

    void sendWhatsAppMessage(WhatsAppRequest request);

    void unprocessedDue(@Valid @RequestBody UnprocessedAlignerDue request);
}
