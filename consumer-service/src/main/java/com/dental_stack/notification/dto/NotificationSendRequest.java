package com.dental_stack.notification.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationSendRequest {
    private String message;
    private String mobile;
    private String title;
    private String email;
    private int notificationIndex;
    @Nullable private Boolean isDoctorApp;
    @Nullable private Long patientId;
    @Nullable private Long alignerJourneyId;
    @Nullable private Long alignerActionId;
    @Nullable private String globalId;
    @Nullable private String doctorRole;
}
