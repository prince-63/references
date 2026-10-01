package com.dental_stack.notification.config;

import com.dental_stack.application.DatabaseContextHolder;
import com.dental_stack.application.DatabaseType;
import com.dental_stack.exception.notification.UnsupportedNotificationTypeException;
import com.dental_stack.notification.client.ChatServiceClient;
import com.dental_stack.notification.client.ChatServiceClientFactory;
import com.dental_stack.notification.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DevNotificationConfig {

    private final ObjectMapper objectMapper;

    @Autowired private ChatServiceClientFactory clientFactory;

    @Bean
    public Consumer<NotificationChunkMessage> devNotificationConsumer() {
        return message -> {
            try {
                DatabaseContextHolder.set(DatabaseType.DEV);
                log.info("Received notification chunk message Type: {}", message.getMessageType());
                sendNotification(message);
                log.info(
                        "Successfully processed notification chunk message Type: {}",
                        message.getMessageType());
            } catch (Exception e) {
                log.error(
                        "Failed to process notification | Type: {} | Error: {}",
                        message.getMessageType(),
                        e.getMessage(),
                        e);
                throw e; // Re-throw to trigger RabbitMQ retry
            } finally {
                DatabaseContextHolder.clear();
            }
        };
    }

    private void sendNotification(NotificationChunkMessage message) {
        ChatServiceClient client = clientFactory.getClient();
        switch (message.getMessageType()) {
            case ORDER_UNPROCESSED_DUE -> {
                UnprocessedAlignerDue req =
                        objectMapper.convertValue(message.getData(), UnprocessedAlignerDue.class);
                client.unprocessedDue(req);
            }
            case SUBSCRIPTION_TRIAL_EXPIRING -> {
                SubscriptionEmailRequest req =
                        objectMapper.convertValue(
                                message.getData(), SubscriptionEmailRequest.class);
                client.trialPlanExpiring(req);
            }
            case SUBSCRIPTION_TRIAL_EXPIRED -> {
                SubscriptionEmailRequest req =
                        objectMapper.convertValue(
                                message.getData(), SubscriptionEmailRequest.class);
                client.trialPlanExpired(req);
            }
            case SUBSCRIPTION_PAID_PLAN_EXPIRED -> {
                SubscriptionEmailRequest req =
                        objectMapper.convertValue(
                                message.getData(), SubscriptionEmailRequest.class);
                client.subscriptionPlanExpired(req);
            }
            case SUBSCRIPTION_PAID_PLAN_RENEWAL -> {
                SubscriptionEmailRequest req =
                        objectMapper.convertValue(
                                message.getData(), SubscriptionEmailRequest.class);
                client.paidPlanRenewal(req);
            }
            case PATIENT_ASSIGNED_TO_PRACTICE -> {
                EmailSendReq req = objectMapper.convertValue(message.getData(), EmailSendReq.class);
                client.newPatientAssignedToPractice(req);
            }
            case PATIENT_CONSOLIDATED_REPORT -> {
                PatientConsolidatedDetailsMail req =
                        objectMapper.convertValue(
                                message.getData(), PatientConsolidatedDetailsMail.class);
                client.consolidatedMail(req);
            }
            case WHATSAPP_MESSAGE_SENT -> {
                WhatsAppRequest req =
                        objectMapper.convertValue(message.getData(), WhatsAppRequest.class);
                client.sendWhatsAppMessage(req);
            }
            case SEND_NOTIFICATION -> {
                NotificationSendRequest req =
                        objectMapper.convertValue(message.getData(), NotificationSendRequest.class);
                client.notificationSend(req);
            }
            default -> throw new UnsupportedNotificationTypeException(
                    message.getMessageType().toString());
        }
    }
}
