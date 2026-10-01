package com.dentalstack.patient.feature.crons.jobs;

import static org.quartz.TriggerKey.triggerKey;

import com.dentalstack.patient.feature.appointment.entity.AppointmentReminder;
import com.dentalstack.patient.feature.appointment.repository.AppointmentReminderRepository;
import com.dentalstack.patient.feature.appointment.service.AppointmentService;
import com.dentalstack.patient.feature.billing.service.PaymentService;
import com.dentalstack.patient.feature.doctor.repository.DoctorRepository;
import com.dentalstack.patient.feature.notification.service.EmailService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.tracking.service.TrackingService;
import com.dentalstack.patient.feature.treatment.enums.CreationStatus;
import com.dentalstack.patient.feature.treatment.enums.ProgressStatus;
import com.dentalstack.patient.feature.treatment.repository.AlignerJourneyRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DailyNotificationsCronJob implements Job {

    public static final String DAILY_NOTIFICATIONS_CRON_JOB_KEY = "daily_notifications_cron";

    public static final String NOTIFICATION_CRON_GROUP = "notification_crons";

    public static String DAILY_NOTIFICATION_CRON;

    @Value("${app.cron.daily-notifications}")
    private String cronExpression;

    @Value("${app.cron.daily-notifications}")
    public void setCronExpression(String cronExpression) {
        DAILY_NOTIFICATION_CRON = cronExpression;
    }

    @Autowired
    private AlignerJourneyRepository alignerJourneyRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AppointmentReminderRepository appointmentReminderRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private TrackingService trackingService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private EmailService emailService;

    @Override
    public void execute(JobExecutionContext context) {

        alignerJourneyRepository
                .findByCreationStatusAndProgressStatus(CreationStatus.DONE, ProgressStatus.IN_PROGRESS)
                .forEach(alignerJourney -> {
                    notificationService.notificationForCompliance(alignerJourney);
                    notificationService.notificationForMilestones(alignerJourney);
                    notificationService.notificationForMissedAlignerChange(alignerJourney);
                    notificationService.notificationForTreatmentStartingToday(alignerJourney);
                    notificationService.sendOneDayPriorReminderOfAlignerChange(alignerJourney);
                    notificationService.sendReminderOfAlignerCheckIn(alignerJourney);
                });
        alignerJourneyRepository
                .findByCreationStatusAndProgressStatus(CreationStatus.DONE, ProgressStatus.NOT_STARTED)
                .forEach(alignerJourney -> {
                    notificationService.notificationForTreatmentStartingTomorrow(alignerJourney);
                });
        LocalDate today = LocalDate.now();
        LocalDate oneDayBefore = today.plusDays(1);
        ReminderStatus status = ReminderStatus.ACTIVE;

        List<AppointmentReminder> oneDayPriorReminders =
                appointmentReminderRepository.findByDateAndStatus(oneDayBefore, status);
        oneDayPriorReminders.forEach(notificationService::sendOneDayPriorReminderOfAppointment);

        paymentService.paymentReminder();
        appointmentService.todayAppointmentReminder();
        trackingService.reminderForPausedTreatment();
        trackingService.refinementReminder();
        trackingService.reminderForResumeTreatment();
    }

    public static JobDetail toJobDetails() {
        return JobBuilder.newJob(DailyNotificationsCronJob.class)
                .withIdentity(JobKey.jobKey(key(), NOTIFICATION_CRON_GROUP))
                .storeDurably()
                .build();
    }

    public static Trigger toTrigger() {
        var builder = CronScheduleBuilder.cronSchedule(DAILY_NOTIFICATION_CRON);
        return TriggerBuilder.newTrigger()
                .forJob(JobKey.jobKey(key(), NOTIFICATION_CRON_GROUP))
                .withIdentity(triggerKey(key(), NOTIFICATION_CRON_GROUP))
                .withSchedule(builder)
                .startNow()
                .endAt(null)
                .build();
    }

    public static JobKey jobKey() {
        return JobKey.jobKey(key(), NOTIFICATION_CRON_GROUP);
    }

    public static String key() {
        return DAILY_NOTIFICATIONS_CRON_JOB_KEY + "_" + DAILY_NOTIFICATION_CRON;
    }
}
