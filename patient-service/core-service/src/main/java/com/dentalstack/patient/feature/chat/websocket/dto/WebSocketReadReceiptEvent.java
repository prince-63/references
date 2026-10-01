package com.dentalstack.patient.feature.chat.websocket.dto;

import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WebSocketReadReceiptEvent {

    private Long chatId;
    private Long readerProfileId;
    private String readerName;
    private List<Long> messageIds;
    private ZonedDateTime readAt;
}
