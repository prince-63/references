package com.dentalstack.patient.feature.notification.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatAndUnreadMessageResponse {

    private Long unreadMessageCount;
    List<Long> unreadMessageIds;
    private String patientName;
    private String patientProfile;
    private Long alignerJourneyId;
    private String fullName;
}
