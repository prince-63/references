package com.dental_stack.notification.dto;

import com.dental_stack.notification.enums.NotificationEventType;
import lombok.Data;

@Data
public class NotificationChunkMessage {
    private String jobId;
    private NotificationEventType messageType;
    private Object data;
}
