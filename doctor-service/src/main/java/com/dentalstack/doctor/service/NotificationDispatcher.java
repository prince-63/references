package com.dentalstack.doctor.service;

import com.dentalstack.doctor.client.PatientServiceClient;
import com.dentalstack.doctor.dto.CreateCardDisplayConfigRequestDto;
import com.dentalstack.doctor.dto.mail.welcome.WelcomeEmailRequest;
import com.dentalstack.doctor.entity.Doctor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Async dispatcher for fire-and-forget notifications (CS-20 fix).
 * Moves Slack, email, card-display-config calls out of @Transactional methods.
 * Failures are logged but never propagate to the caller or affect transactions.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationDispatcher {

    private final SlackService slackService;
    private final ChatService chatService;
    private final PatientServiceClient patientServiceClient;

    @Async("notificationExecutor")
    public void sendSlackNotification(Doctor doctor, boolean isNewDoctor) {
        try {
            slackService.sendSlackNotification(doctor, isNewDoctor);
        } catch (Exception e) {
            log.warn("Failed to send Slack notification for doctor {}: {}", doctor.getId(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void sendWelcomeMail(WelcomeEmailRequest request) {
        try {
            chatService.sendWelcomeMailToUser(request);
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", request.getDoctorEmail(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void createCardDisplayConfig(long profileId) {
        try {
            patientServiceClient.createCardDisplayConfig(new CreateCardDisplayConfigRequestDto(profileId));
        } catch (Exception e) {
            log.warn("Failed to create card display config for profile {}: {}", profileId, e.getMessage());
        }
    }
}
