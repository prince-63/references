package com.dentalstack.patient.feature.crons.jobs;

import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.EmailService;
import com.dentalstack.patient.feature.subscription.service.SubscriptionNotificationService;
import com.dentalstack.patient.feature.treatment.service.AlignerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ScheduledTasks {
    @Autowired
    private ChatService chatService;

    @Autowired
    private AlignerService alignerService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SubscriptionNotificationService subscriptionNotificationService;

    @Scheduled(cron = "0 */30 * * * *") // Runs every 30 minutes
    public void liveActivityNotification() {
        chatService.notificationForLiveActivity();
        log.info("Executing Every Three Hours Job");
    }

    // Runs daily at 10 AM
    @Scheduled(cron = "0 0 10 * * *")
    public void dailyMorningNotification() {
        alignerService.processAlignerChanges();
        log.info("Executing Daily 10 AM Job");
    }

    // Runs every 4 days at 9:30 AM (1st, 5th, 9th, 13th, 17th, etc.)
    @Scheduled(cron = "0 30 9 1/4 * *")
    public void quadDailyMorningNotification() {
        emailService.patientConsolidatedDetailsMail();
        log.info("Executing Job Every 4 Days at 9:30 AM");
    }

    @Scheduled(cron = "0 0 11 * * *") // Runs every day at 11 AM
    public void processSubscriptionNotifications() {
        log.info("Starting subscription notification process");
        subscriptionNotificationService.processSubscriptionNotifications();
    }

    @Scheduled(cron = "0 0 0 * * *") // Run daily at midnight
    public void updateAlignerProductionStatus() {
        alignerService.updateAlignerProductionStatus();
    }

    @Scheduled(cron = "0 0 0 * * *") // Runs at midnight every day
    public void clearProcessedNotifications() {
        subscriptionNotificationService.clearProcessedNotifications();
        log.info("Cleared processed notifications tracker");
    }
}
