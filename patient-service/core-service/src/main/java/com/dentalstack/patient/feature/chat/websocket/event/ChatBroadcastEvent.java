package com.dentalstack.patient.feature.chat.websocket.event;

import com.dentalstack.patient.feature.chat.websocket.dto.WebSocketMessageEvent;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ChatBroadcastEvent extends ApplicationEvent {

    private final Long chatId;
    private final Long senderId;
    private final Long patientId;
    private final WebSocketMessageEvent messageEvent;

    public ChatBroadcastEvent(
            Object source, Long chatId, Long senderId, Long patientId, WebSocketMessageEvent messageEvent) {
        super(source);
        this.chatId = chatId;
        this.senderId = senderId;
        this.patientId = patientId;
        this.messageEvent = messageEvent;
    }
}
