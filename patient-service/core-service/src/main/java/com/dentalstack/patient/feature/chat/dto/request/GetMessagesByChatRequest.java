package com.dentalstack.patient.feature.chat.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetMessagesByChatRequest {
    private Long chatId;
    private Long profileId;
    private int page = 0;
    private int size = 50;
}
