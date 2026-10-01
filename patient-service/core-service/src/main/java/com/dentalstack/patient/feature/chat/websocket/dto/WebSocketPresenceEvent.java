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
public class WebSocketPresenceEvent {

    private String username;
    private Boolean isOnline;
    private ZonedDateTime timestamp;
}
