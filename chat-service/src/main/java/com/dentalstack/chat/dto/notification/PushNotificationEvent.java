package com.dentalstack.chat.dto.notification;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published to RabbitMQ for async push notification sending.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PushNotificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String message;
    private String mobile;
    private String title;
    private int notificationIndex;
    private Boolean isDoctorApp;
    private Long patientId;
    private String email;
    private Long alignerJourneyId;
    private Long alignerActionId;
    private String globalId;
    private String serviceName;
    private String doctorRole;
}
