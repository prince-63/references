package com.dentalstack.chat.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "web_notification")
public class WebNotification extends BaseEntity {

    private String notificationTitle;

    private Long doctorId;

    private String notificationBody;

    private Long patientId;

    private boolean active;

    private Long createdBy;
}
