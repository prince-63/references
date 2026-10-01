package com.dentalstack.patient.feature.chat.dto.response.v2.response;

import com.dentalstack.patient.feature.chat.dto.response.UserProfileInfoResponse;
import com.dentalstack.patient.feature.chat.enums.MessageType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponseV2 {

    private Long id;
    private Long chatId;
    private MessageType messageType;
    private String textContent;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime editedAt;
    private Boolean isEdited;

    private UserProfileInfoResponse sender;
}
