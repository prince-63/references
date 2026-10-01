package com.dental_stack.notification.dto;

import lombok.Data;

@Data
public class CreateNotification {
    private String notificationTitle;
    private Long doctorId;
    private String notificationBody;
    private Long doctorUserId;
    private Long PatientId;
    private Long patientUserId;
}
