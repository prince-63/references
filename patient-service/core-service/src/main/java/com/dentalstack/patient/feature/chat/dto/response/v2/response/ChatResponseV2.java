package com.dentalstack.patient.feature.chat.dto.response.v2.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponseV2 {

    private Long id;
    private Long patientId;
    private String patientName;
    private String patientProfilePicture;
    private String chatName;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private Integer unreadCount;
    private String customerMappedId;

    private MessageResponseV2 lastMessage;
    private AlignerCheckInResponseV2 latestAlignerCheckIn;
    private String patientAddedByName;
}
