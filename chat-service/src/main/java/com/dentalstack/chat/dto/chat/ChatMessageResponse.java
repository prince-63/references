package com.dentalstack.chat.dto.chat;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ChatMessageResponse {

    // ChatResponse chatResponse;

    private int unreadMessage;

    private Long chatId;

    private String message;

    private Long doctorId;

    private Long patientId;

    private String[] imageName;

    private LocalDateTime createdDate;

    private String createdBy;

    private String roleName;

    private String profileImage;

    private Long profileImageId;

    private String patientName;

    private Long userId;

    private Long unreadMessageChatId;

    private Long alignerJourneyId;

    private String fullName;
}
