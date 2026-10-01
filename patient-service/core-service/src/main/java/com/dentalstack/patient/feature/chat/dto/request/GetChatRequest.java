package com.dentalstack.patient.feature.chat.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetChatRequest {
    private Long profileId;
    private Long chatId;
}
