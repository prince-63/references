package com.dentalstack.patient.feature.crons.jobs;

import static com.dentalstack.patient.feature.reminder.entity.Reminder.REMINDER_INFO_KEY;

import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import jakarta.annotation.Nullable;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ReminderJob implements Job {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ReminderRepository reminderRepository;

    @Nullable
    public static Trigger toTrigger(JobDetail job) {
        var reminder = (Reminder) job.getJobDataMap().get(REMINDER_INFO_KEY);

        if (reminder.getFrequency().equals(Frequency.DAILY)) {
            var time = reminder.getTime();
            var builder = CronScheduleBuilder.dailyAtHourAndMinute(time.getHour(), time.getMinute());
            return TriggerBuilder.newTrigger()
                    .forJob(job.getKey())
                    .withIdentity(reminder.triggerKey())
                    .withSchedule(builder)
                    .startNow()
                    .endAt(null)
                    .build();
        } else {
            if (reminder.getDate() == null || reminder.getZone() == null) {
                return null;
            }

            Instant instant = reminder.getTime()
                    .atDate(reminder.getDate())
                    .atZone(ZoneId.of("Asia/Kolkata"))
                    .toInstant();

            return TriggerBuilder.newTrigger()
                    .forJob(job.getKey())
                    .withIdentity(reminder.triggerKey())
                    .startAt(Date.from(instant))
                    .build();
        }
    }

    @Override
    public void execute(JobExecutionContext context) {
        JobDataMap jobDataMap = context.getJobDetail().getJobDataMap();
        var reminder = (Reminder) jobDataMap.get(REMINDER_INFO_KEY);

        if (!reminder.getStatus().equals(ReminderStatus.ACTIVE)) return;

        switch (reminder.getChannel()) {
            case PUSH_NOTIFICATION -> sendPushNotification(reminder);
            case IN_APP_UPDATE -> sendInAppUpdate(reminder);
        }
        var now = ZonedDateTime.now();
        reminder.setLastTriggeredAt(now);
        reminderRepository.save(reminder);
        log.info(
                "Triggered the reminder with id {} for {} at {}",
                reminder.getId(),
                reminder.getPurpose().toString(),
                now);
    }

    public static JobDetail newJobDetail(Reminder reminder) {
        JobDataMap jobDataMap = new JobDataMap();
        jobDataMap.put(REMINDER_INFO_KEY, reminder);

        return JobBuilder.newJob(ReminderJob.class)
                .withIdentity(reminder.jobKey())
                .setJobData(jobDataMap)
                .storeDurably()
                .build();
    }

    private void sendPushNotification(Reminder reminder) {
        notificationService.sendPushNotification(reminder);
        notificationService.webNotificationEvent(reminder);
        if (reminder.getFrequency().equals(Frequency.ONE_TIME)) {
            reminder.setStatus(ReminderStatus.TRIGGERED);
        }
    }

    private void sendInAppUpdate(Reminder reminder) {
        // TODO
    }
}
