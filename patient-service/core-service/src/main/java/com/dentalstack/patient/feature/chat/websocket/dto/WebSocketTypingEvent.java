package com.dentalstack.patient.feature.chat.websocket.dto;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WebSocketTypingEvent {

    private Long chatId;
    private Long userProfileId;
    private String userName;
    private Boolean isTyping;
    private ZonedDateTime timestamp;
}
