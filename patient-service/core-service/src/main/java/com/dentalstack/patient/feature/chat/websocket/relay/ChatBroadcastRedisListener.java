package com.dentalstack.patient.feature.chat.websocket.relay;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatBroadcastRedisListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private volatile boolean shuttingDown = false;

    @EventListener(ContextClosedEvent.class)
    public void onApplicationShutdown() {
        shuttingDown = true;
        log.info("[CHAT-REDIS-LISTEN] Application shutting down — will drop incoming messages");
    }

    public void handleMessage(String json) {
        if (shuttingDown) {
            log.debug("[CHAT-REDIS-LISTEN] Ignoring message during shutdown");
            return;
        }
        ChatBroadcastPayload payload;
        try {
            payload = objectMapper.readValue(json, ChatBroadcastPayload.class);
        } catch (Exception e) {
            log.error("[CHAT-REDIS-LISTEN] Failed to deserialise broadcast payload: {}", e.getMessage(), e);
            return;
        }

        Long chatId = payload.getChatId();
        String eventType =
                payload.getBaseEvent() != null ? payload.getBaseEvent().getEventType() : "unknown";
        log.info("[CHAT-REDIS-LISTEN] Received broadcast for chatId={} eventType={}", chatId, eventType);

        if (payload.getDeliveries() != null) {
            for (ChatBroadcastPayload.ParticipantDelivery delivery : payload.getDeliveries()) {
                try {
                    messagingTemplate.convertAndSendToUser(delivery.getEmail(), "/queue/messages", delivery.getEvent());
                    messagingTemplate.convertAndSendToUser(delivery.getEmail(), "/messages", delivery.getEvent());
                    log.debug(
                            "[CHAT-REDIS-LISTEN] Sent to /user/{}/queue/messages for chatId={}",
                            delivery.getEmail(),
                            chatId);
                } catch (Exception e) {
                    log.warn("[CHAT-REDIS-LISTEN] Failed to send to user {}: {}", delivery.getEmail(), e.getMessage());
                }
            }
        }

        if (payload.getBaseEvent() != null) {
            try {
                messagingTemplate.convertAndSend("/topic/chat/" + chatId, payload.getBaseEvent());
                log.debug("[CHAT-REDIS-LISTEN] Sent to /topic/chat/{}", chatId);
            } catch (Exception e) {
                log.warn("[CHAT-REDIS-LISTEN] Failed to broadcast to /topic/chat/{}: {}", chatId, e.getMessage());
            }
        }

        log.info("[CHAT-REDIS-LISTEN] Delivery complete for chatId={} eventType={}", chatId, eventType);
    }
}
