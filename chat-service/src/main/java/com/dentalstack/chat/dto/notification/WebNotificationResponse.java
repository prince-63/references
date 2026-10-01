package com.dentalstack.chat.dto.notification;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WebNotificationResponse {

    private String title;

    private String body;

    private String icon;

    private String image;

    private Long notificationId;

    private Long patientId;

    private Long patientUserId;
}
