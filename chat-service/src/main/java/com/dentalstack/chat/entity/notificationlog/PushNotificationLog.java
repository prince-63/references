package com.dentalstack.chat.entity.notificationlog;

import com.dentalstack.chat.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "push_notification_log")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
@Setter
@Entity
public class PushNotificationLog extends BaseEntity {

    @Column(nullable = false)
    private String email;

    @Column
    private String title;

    private String message;
    private String topic;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        SENT,
        FAILED
    }
}
