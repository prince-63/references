package com.dentalstack.doctor.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class SendNotificationRequest {
    private String message;
    private String mobile;
    private String title;
    private int notificationIndex;
    private Boolean isDoctorApp;
    private String email;
    private Long patientId;
    private Long alignerJourneyId;
    private Long alignerActionId;
    private String globalId; // use this to send any Id to frontend
    private String name;
    private String doctorRole;

    public static SendNotificationRequest from(
            String message, String mobile, String title, int notificationIndex, String email) {
        return SendNotificationRequest.builder()
                .message(message)
                .mobile(mobile)
                .email(email)
                .title(title)
                .notificationIndex(notificationIndex)
                .build();
    }

    public static SendNotificationRequest from(
            String message, String mobile, String title, int notificationIndex, String email, boolean isDoctorApp) {
        return SendNotificationRequest.builder()
                .message(message)
                .mobile(mobile)
                .email(email)
                .title(title)
                .notificationIndex(notificationIndex)
                .isDoctorApp(isDoctorApp)
                .build();
    }

    public static SendNotificationRequest from(
            String message,
            String mobile,
            String title,
            int notificationIndex,
            String email,
            boolean isDoctorApp,
            Long patientId) {
        return SendNotificationRequest.builder()
                .message(message)
                .mobile(mobile)
                .email(email)
                .title(title)
                .notificationIndex(notificationIndex)
                .isDoctorApp(isDoctorApp)
                .patientId(patientId)
                .build();
    }
}
