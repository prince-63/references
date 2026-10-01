package com.dentalstack.patient.feature.chat.websocket.relay;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatBroadcastRedisPublisher {

    public static final String CHANNEL = "chat:broadcast";

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public void publish(ChatBroadcastPayload payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            log.info(
                    "[CHAT-REDIS] Publishing to channel={} chatId={} eventType={} deliveries={}",
                    CHANNEL,
                    payload.getChatId(),
                    payload.getBaseEvent() != null ? payload.getBaseEvent().getEventType() : "null",
                    payload.getDeliveries() != null ? payload.getDeliveries().size() : 0);
            stringRedisTemplate.convertAndSend(CHANNEL, json);
            log.info("[CHAT-REDIS] Published successfully for chatId={}", payload.getChatId());
        } catch (JsonProcessingException e) {
            log.error(
                    "[CHAT-REDIS] Failed to serialise broadcast payload for chatId={}: {}",
                    payload.getChatId(),
                    e.getMessage(),
                    e);
        }
    }
}
