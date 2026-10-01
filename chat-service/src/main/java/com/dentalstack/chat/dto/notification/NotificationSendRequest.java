package com.dentalstack.chat.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationSendRequest {

    private String message;
    private String mobile;
    private String title;
    private String email;
    private int notificationIndex;

    @Nullable
    private Boolean isDoctorApp;

    @Nullable
    private Long patientId;

    @Nullable
    private Long alignerJourneyId;

    @Nullable
    private Long alignerActionId;

    @Nullable
    private String globalId;

    @Nullable
    private String doctorRole;

    @Nullable
    private String serviceName;

    private String xOrgName;

    private Long organizationId;
}
