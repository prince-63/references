package com.dentalstack.patient.feature.chat.dto.request;

import com.dentalstack.patient.feature.chat.enums.MessageType;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SendMessageRequest {

    @NotNull(message = "Chat ID is required")
    private Long chatId;

    @NotNull(message = "Message type is required")
    private MessageType messageType;

    private String textContent;

    private Long replyToMessageId;

    private List<AttachmentRequest> attachments;
    private Long profileId;
    private Long doctorId;
}
