package com.dentalstack.chat.service;

import com.dentalstack.chat.dto.notification.CreateNotification;
import com.dentalstack.chat.dto.notification.NotificationSeenRequest;
import com.dentalstack.chat.dto.notification.WebNotificationResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.ResponseEntity;

public interface NotificationService {
    ResponseEntity<String> sendNotification(
            String s,
            String mobile,
            String messageReceived,
            int i,
            Boolean isDoctorApp,
            Long patientId,
            String email,
            Long alignerJourneyId,
            Long alignerActionId,
            String globalId,
            String serviceName,
            String doctorRole,
            String xOrgName,
            Long organizationId)
            throws IOException;

    void createNotification(CreateNotification createNotification);

    List<WebNotificationResponse> getNotificationList(Long doctorId);

    void seenNotification(NotificationSeenRequest notificationSeenRequest);
}
