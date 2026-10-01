package com.dental_stack.notification.dto;

import java.util.List;
import lombok.Data;

@Data
public class NotificationSeenRequest {
    private List<Long> notificationId;
}
