package com.dentalstack.patient.feature.crons.jobs;

import static org.quartz.TriggerKey.triggerKey;

import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.reminder.enums.ReminderType;
import com.dentalstack.patient.feature.treatment.entity.Aligner;
import com.dentalstack.patient.feature.treatment.entity.CustomAlignerReminder;
import com.dentalstack.patient.feature.treatment.entity.DefaultAlignerReminder;
import jakarta.annotation.Nullable;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Slf4j
public class AlignerReminderInfo implements Serializable {
    public static final String ALIGNER_REMINDERS_GROUP = "aligner_reminders";
    public static final String ALIGNER_REMINDER_INFO_KEY = "aligner_reminder_info";

    private Long alignerJourneyId;
    private int alignerSrNo;
    private Long reminderId;
    private ReminderType reminderType;
    private Frequency frequency;
    private LocalDate date;
    private LocalTime time;
    private String email;

    private String message;
    private String title;
    private Integer notificationIndex;

    public static AlignerReminderInfo from(CustomAlignerReminder customAlignerReminder, int messageIndex) {
        String message;
        if (messageIndex == 1) {
            message = "It's time to wear your aligners! Remember to put them on and start tracking.";
        } else {
            message = "It’s time to put your Aligners back on!";
        }

        var alignerJourney = customAlignerReminder.getAlignerJourney();
        return AlignerReminderInfo.builder()
                .alignerJourneyId(alignerJourney.getId())
                .alignerSrNo(-1) // Custom reminders are not associated with particular aligner sr no.
                .reminderId(customAlignerReminder.getId())
                .reminderType(ReminderType.CUSTOM)
                .frequency(customAlignerReminder.getFrequency())
                .date(customAlignerReminder.getDate())
                .time(customAlignerReminder.getTime())
                .email(customAlignerReminder.getEmail())
                .message(message)
                .title("Aligner wear reminder")
                .notificationIndex(14)
                .build();
    }

    public static AlignerReminderInfo from(CustomAlignerReminder customAlignerReminder) {
        var alignerJourney = customAlignerReminder.getAlignerJourney();
        return AlignerReminderInfo.builder()
                .alignerJourneyId(alignerJourney.getId())
                .alignerSrNo(-1) // Custom reminders are not associated with particular aligner sr no.
                .reminderId(customAlignerReminder.getId())
                .reminderType(ReminderType.CUSTOM)
                .frequency(customAlignerReminder.getFrequency())
                .date(customAlignerReminder.getDate())
                .time(customAlignerReminder.getTime())
                .email(customAlignerReminder.getEmail())
                .message("It's time to wear your aligners! Remember to put them on and start tracking.")
                .title("Aligner wear reminder")
                .notificationIndex(14)
                .build();
    }

    public static JobDetail toJobDetail(AlignerReminderInfo info) {
        final JobDataMap jobDataMap = new JobDataMap();
        jobDataMap.put(ALIGNER_REMINDER_INFO_KEY, info);

        return JobBuilder.newJob(AlignerReminderJob.class)
                .withIdentity(JobKey.jobKey(info.reminderKey(), ALIGNER_REMINDERS_GROUP))
                .setJobData(jobDataMap)
                .storeDurably()
                .build();
    }

    public static Trigger toTrigger(JobDetail job) {
        var info = (AlignerReminderInfo) job.getJobDataMap().get(ALIGNER_REMINDER_INFO_KEY);

        if (info.getFrequency().equals(Frequency.DAILY)) {
            var time = info.getTime();
            var builder = CronScheduleBuilder.dailyAtHourAndMinute(time.getHour(), time.getMinute());
            return TriggerBuilder.newTrigger()
                    .forJob(job.getKey())
                    .withIdentity(triggerKey(info.reminderKey(), ALIGNER_REMINDERS_GROUP))
                    .withSchedule(builder)
                    .startNow()
                    .endAt(null)
                    .build();
        } else {
            Instant instant = info.getTime()
                    .atDate(info.getDate())
                    .atZone(ZoneId.of("Asia/Kolkata"))
                    .toInstant();

            return TriggerBuilder.newTrigger()
                    .forJob(job.getKey())
                    .withIdentity(triggerKey(info.reminderKey(), ALIGNER_REMINDERS_GROUP))
                    .startAt(Date.from(instant))
                    .build();
        }
    }

    public static String reminderKey(DefaultAlignerReminder reminder, Aligner a) {
        return String.join(
                "_",
                Frequency.ONE_TIME.name().toLowerCase(),
                ReminderType.DEFAULT.name().toLowerCase(),
                String.valueOf(reminder.getAlignerJourney().getId()),
                String.valueOf(a.getSrNo()),
                String.valueOf(reminder.getId()));
    }

    public String reminderKey() {
        return String.join(
                "_",
                frequency.name().toLowerCase(),
                reminderType.name().toLowerCase(),
                String.valueOf(alignerJourneyId),
                String.valueOf(alignerSrNo),
                String.valueOf(reminderId));
    }

    public static String reminderKey(CustomAlignerReminder reminder) {
        return String.join(
                "_",
                reminder.getFrequency().name().toLowerCase(),
                ReminderType.CUSTOM.name().toLowerCase(),
                String.valueOf(reminder.getAlignerJourney().getId()),
                String.valueOf(-1),
                String.valueOf(reminder.getId()));
    }

    @Nullable
    public static JobKey reminderKey(DefaultAlignerReminder reminder) {
        var alignerJourney = reminder.getAlignerJourney();
        var currentAligner = alignerJourney.getCurrentAligner();
        if (currentAligner == null) {
            return null;
        }
        return new JobKey(
                String.join(
                        "_",
                        Frequency.ONE_TIME.name().toLowerCase(),
                        ReminderType.DEFAULT.name().toLowerCase(),
                        String.valueOf(currentAligner.getId()),
                        String.valueOf(currentAligner.getSrNo()),
                        String.valueOf(reminder.getId())),
                ALIGNER_REMINDERS_GROUP);
    }
}
