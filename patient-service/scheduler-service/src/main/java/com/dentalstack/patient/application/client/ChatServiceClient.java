package com.dentalstack.patient.application.client;

import com.dentalstack.patient.feature.notification.dto.EmailSendReq;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.UnprocessedAlignerDue;
import com.dentalstack.patient.feature.subscription.dto.SubscriptionEmailRequest;
import com.dentalstack.patient.feature.whatsapp.dto.WhatsAppRequest;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "chat-service", url = "${spring.cloud.openfeign.client.config.chat-service.url}")
public interface ChatServiceClient {

    @PostMapping("/notification/v1/send/notification")
    String sendNotification(@RequestBody SendNotificationRequest sendNotificationRequest);

    @PostMapping("/mail/new-patient-assigned-to-practice")
    void newPatientAssignedToPractice(@Valid @RequestBody EmailSendReq request);

    // subscription related
    @PostMapping("/subscription/email/v1/trial-plan-expiring")
    void trialPlanExpiring(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/trial-plan-expired")
    void trialPlanExpired(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/paid-plan-expired")
    void subscriptionPlanExpired(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/paid-plan-renewal")
    void paidPlanRenewal(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/chat/whatsapp/notification/v1/send-message")
    void sendWhatsAppMessage(@RequestBody WhatsAppRequest request);

    @PostMapping("/order/management/email/v1/unprocessed-due")
    void unprocessedDue(@Valid @RequestBody UnprocessedAlignerDue request);
}
