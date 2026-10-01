package com.dentalstack.patient.feature.treatmenttracking.dto.chat;

import java.util.List;
import lombok.Data;

@Data
public class ChatHistoryResponse {
    private List<ChatMessageResponse> messages;
    private int page;
    private int size;
    private long totalElements;
}
