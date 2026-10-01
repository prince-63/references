package com.dentalstack.patient.feature.notification.dto;

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
    private String globalId;
    private String name;
    private String doctorRole;
    private String serviceName;
    private String xOrgName;
    private Long organizationId;

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
            String message,
            String mobile,
            String title,
            int notificationIndex,
            String email,
            boolean isDoctorApp,
            String xOrgName,
            Long organizationId) {
        return SendNotificationRequest.builder()
                .message(message)
                .mobile(mobile)
                .email(email)
                .title(title)
                .notificationIndex(notificationIndex)
                .isDoctorApp(isDoctorApp)
                .xOrgName(xOrgName)
                .organizationId(organizationId)
                .build();
    }

    public static SendNotificationRequest from(
            String message,
            String mobile,
            String title,
            int notificationIndex,
            String email,
            boolean isDoctorApp,
            Long patientId,
            String xOrgName,
            Long organizationId) {
        return SendNotificationRequest.builder()
                .message(message)
                .mobile(mobile)
                .email(email)
                .title(title)
                .notificationIndex(notificationIndex)
                .isDoctorApp(isDoctorApp)
                .patientId(patientId)
                .xOrgName(xOrgName)
                .organizationId(organizationId)
                .build();
    }

    public static SendNotificationRequest from(
            String message,
            String mobile,
            String title,
            int notificationIndex,
            String email,
            String xOrgName,
            Long organizationId) {
        return SendNotificationRequest.builder()
                .message(message)
                .mobile(mobile)
                .email(email)
                .title(title)
                .notificationIndex(notificationIndex)
                .xOrgName(xOrgName)
                .organizationId(organizationId)
                .build();
    }
}
