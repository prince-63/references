package com.dentalstack.chat.dto.notification;

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
