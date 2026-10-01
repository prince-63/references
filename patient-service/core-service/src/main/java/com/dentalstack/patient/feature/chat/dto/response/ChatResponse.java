package com.dentalstack.patient.feature.chat.dto.response;

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
public class ChatResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private String patientProfilePicture;
    private String chatName;
    private String description;
    private Boolean isActive;
    private ZonedDateTime createdAt;
    private ZonedDateTime lastMessageAt;
    private Integer unreadCount;
    private Integer totalParticipants;
    private String customerMappedId;

    private List<ChatParticipantResponse> participants;
    private List<CaseTeamResponse> caseTeams;

    private MessageResponse lastMessage;
    private AlignerCheckInResponse latestAlignerCheckIn;
    private String patientAddedByName;
}
