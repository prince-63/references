package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.config.RabbitMQConfig;
import com.dentalstack.chat.dto.notification.CreateNotification;
import com.dentalstack.chat.dto.notification.PushNotificationEvent;
import com.dentalstack.chat.dto.notification.WebNotificationEvent;
import com.dentalstack.chat.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * Consumes notification events from RabbitMQ and processes them.
 * This decouples notification sending from the main chat flow.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.PUSH_NOTIFICATION_QUEUE)
    public void handlePushNotification(PushNotificationEvent event) {
        try {
            log.debug("Processing push notification for email={}", event.getEmail());
            notificationService.sendNotification(
                    event.getMessage(),
                    event.getMobile(),
                    event.getTitle(),
                    event.getNotificationIndex(),
                    event.getIsDoctorApp(),
                    event.getPatientId(),
                    event.getEmail(),
                    event.getAlignerJourneyId(),
                    event.getAlignerActionId(),
                    event.getGlobalId(),
                    event.getServiceName(),
                    event.getDoctorRole(),
                    null,
                    null);
            log.debug("Push notification sent for email={}", event.getEmail());
        } catch (Exception e) {
            log.error("Failed to process push notification for email={}", event.getEmail(), e);
            throw new RuntimeException("Push notification processing failed", e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.WEB_NOTIFICATION_QUEUE)
    public void handleWebNotification(WebNotificationEvent event) {
        try {
            log.debug("Processing web notification for doctorId={}", event.getDoctorId());
            CreateNotification createNotification = new CreateNotification();
            createNotification.setDoctorId(event.getDoctorId());
            createNotification.setPatientId(event.getPatientId());
            createNotification.setNotificationBody(event.getNotificationBody());
            createNotification.setNotificationTitle(event.getNotificationTitle());
            createNotification.setDoctorUserId(event.getDoctorUserId());
            notificationService.createNotification(createNotification);
            log.debug("Web notification created for doctorId={}", event.getDoctorId());
        } catch (Exception e) {
            log.error("Failed to process web notification for doctorId={}", event.getDoctorId(), e);
            throw new RuntimeException("Web notification processing failed", e);
        }
    }
}
