package com.dental_stack.notification.client;

import com.dental_stack.notification.dto.*;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "chat-service")
public interface ChatServiceClient {

    @PostMapping("/order/management/email/v1/unprocessed-due")
    public void unprocessedDue(@Valid @RequestBody UnprocessedAlignerDue request);

    @PostMapping("/subscription/email/v1/trial-plan-expiring")
    public void trialPlanExpiring(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/trial-plan-expired")
    public void trialPlanExpired(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/paid-plan-expired")
    public void subscriptionPlanExpired(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/subscription/email/v1/paid-plan-renewal")
    public void paidPlanRenewal(@Valid @RequestBody SubscriptionEmailRequest request);

    @PostMapping("/mail/new-patient-assigned-to-practice")
    public void newPatientAssignedToPractice(@Valid @RequestBody EmailSendReq request);

    @PostMapping("/mail/consolidated")
    public void consolidatedMail(@Valid @RequestBody PatientConsolidatedDetailsMail request);

    @PostMapping("/chat/whatsapp/notification/v1/send-message")
    public ResponseEntity<String> sendWhatsAppMessage(@RequestBody WhatsAppRequest request);

    @PostMapping("/notification/v1/send/notification")
    public String notificationSend(
            @Valid @RequestBody NotificationSendRequest notificationSendRequest);
}
