package com.dentalstack.chat.dto.notification;

import java.util.List;
import lombok.Data;

@Data
public class NotificationSeenRequest {

    private List<Long> notificationId;
}
