package com.dentalstack.chat.dto.notification;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published to RabbitMQ for async web notification creation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebNotificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long doctorId;
    private Long patientId;
    private String notificationBody;
    private String notificationTitle;
    private Long doctorUserId;
}
