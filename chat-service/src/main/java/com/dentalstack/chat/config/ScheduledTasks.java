package com.dentalstack.chat.config;

import com.dentalstack.chat.entity.Chat;
import com.dentalstack.chat.repository.ChatRepository;
import com.dentalstack.chat.service.SchedulerService;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {

    private final ChatRepository chatRepository;

    private final SchedulerService schedulerService;

    @Scheduled(cron = "0 0 9 * * ?") // Run at 9:00 AM every day
    public void sendReminderEmails() {

        LocalDateTime twoDaysAgoStart = LocalDateTime.now().minusDays(2).with(LocalTime.MIN);
        LocalDateTime twoDaysAgoEnd = twoDaysAgoStart.with(LocalTime.MAX);

        List<Long> distinctPatientIds = chatRepository.findDistinctPatientIdByMessageReadFalseAndRoleName("Patient");

        for (Long patientId : distinctPatientIds) {
            List<Chat> lastUnopenedMessages =
                    chatRepository
                            .findTopByPatientIdAndMessageReadFalseAndRoleNameAndCreatedAtBetweenOrderByCreatedAtDesc(
                                    patientId, "Patient", twoDaysAgoStart, twoDaysAgoEnd);

            if (!lastUnopenedMessages.isEmpty()) {
                try {

                    Chat lastUnopenedMessage = lastUnopenedMessages.get(0);
                    Long doctorId = lastUnopenedMessage.getDoctorId();
                    schedulerService.sendMailForUnseenChat(patientId, doctorId);
                } catch (Exception e) {
                    log.error(
                            "Error sending reminder email and SMS for unopened message from patient ID: {} to doctor ID: {}",
                            patientId,
                            lastUnopenedMessages.get(0).getDoctorId(),
                            e);
                }
            }
        }
    }
}
