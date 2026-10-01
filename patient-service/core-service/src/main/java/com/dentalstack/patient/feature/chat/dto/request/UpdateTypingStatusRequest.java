package com.dentalstack.patient.feature.chat.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTypingStatusRequest {

    @NotNull(message = "Chat ID is required")
    private Long chatId;

    @NotNull(message = "Typing status is required")
    private Boolean isTyping;
}
