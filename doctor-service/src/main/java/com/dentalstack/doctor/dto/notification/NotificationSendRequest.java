package com.dentalstack.doctor.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationSendRequest {

    private String message;
    private String mobile;
    private String title;
    private int notificationIndex;
    private String email;
    private Boolean isDoctorApp;

    public static NotificationSendRequest from(String message, String mobile, String title, int notificationIndex) {
        return NotificationSendRequest.builder()
                .message(message)
                .mobile(mobile)
                .title(title)
                .notificationIndex(notificationIndex)
                .build();
    }
}
