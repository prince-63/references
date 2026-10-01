package com.dentalstack.patient.feature.chat.websocket.relay;

import com.dentalstack.patient.feature.chat.websocket.dto.WebSocketMessageEvent;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatBroadcastPayload implements Serializable {

    private Long chatId;
    private Long senderId;
    private Long patientId;

    private WebSocketMessageEvent baseEvent;

    private List<ParticipantDelivery> deliveries;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ParticipantDelivery implements Serializable {
        private String email;
        private WebSocketMessageEvent event;
    }
}
