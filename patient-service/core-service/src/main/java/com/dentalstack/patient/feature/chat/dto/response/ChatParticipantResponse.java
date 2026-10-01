package com.dentalstack.patient.feature.chat.dto.response;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatParticipantResponse {

    private Long id;
    private Long userProfileId;
    private String userName;
    private String userEmail;
    private String organizationName;
    private String profilePictureUrl;
    private Boolean isOnline;
    private Boolean isTyping;
    private ZonedDateTime lastSeenAt;
    private ZonedDateTime joinedAt;
    private Integer unreadCount;
    private Long addedViaCaseTeamId;
    private String addedViaCaseTeamName;
}
