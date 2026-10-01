package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.config.RabbitMQConfig;
import com.dentalstack.chat.dto.notification.PushNotificationEvent;
import com.dentalstack.chat.dto.notification.WebNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Publishes notification events to RabbitMQ for async processing.
 * Replaces synchronous notification calls in ChatServiceImpl.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Publish a push notification event for async processing.
     */
    public void sendPushNotification(PushNotificationEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.NOTIFICATION_EXCHANGE, RabbitMQConfig.PUSH_NOTIFICATION_ROUTING_KEY, event);
            log.debug("Push notification event published for email={}", event.getEmail());
        } catch (Exception e) {
            log.error("Failed to publish push notification event for email={}", event.getEmail(), e);
        }
    }

    /**
     * Publish a web notification event for async processing.
     */
    public void sendWebNotification(WebNotificationEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.NOTIFICATION_EXCHANGE, RabbitMQConfig.WEB_NOTIFICATION_ROUTING_KEY, event);
            log.debug("Web notification event published for doctorId={}", event.getDoctorId());
        } catch (Exception e) {
            log.error("Failed to publish web notification event for doctorId={}", event.getDoctorId(), e);
        }
    }
}
