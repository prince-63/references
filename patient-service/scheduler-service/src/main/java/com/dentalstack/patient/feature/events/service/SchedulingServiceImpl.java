package com.dentalstack.patient.feature.events.service;

import static com.dentalstack.patient.feature.crons.jobs.AlignerReminderInfo.ALIGNER_REMINDERS_GROUP;

import com.dentalstack.patient.feature.crons.jobs.*;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.enums.DefaultAlignerReminderType;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.reminder.enums.ReminderType;
import com.dentalstack.patient.feature.tracking.enums.TrackingType;
import com.dentalstack.patient.feature.treatment.entity.Aligner;
import com.dentalstack.patient.feature.treatment.entity.CustomAlignerReminder;
import com.dentalstack.patient.feature.treatment.entity.DefaultAlignerReminder;
import com.dentalstack.patient.feature.treatment.enums.ProgressStatus;
import com.dentalstack.patient.feature.treatment.repository.CustomAlignerReminderRepository;
import com.dentalstack.patient.global.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.validation.constraints.NotNull;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class SchedulingServiceImpl implements SchedulingService, ApplicationRunner {

    private final Scheduler scheduler;

    @Autowired
    private DailyEventsUpdateCronJob dailyEventsUpdateCronJob;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private DailyNotificationsCronJob dailyNotificationsCronJob;

    @Autowired
    private CustomAlignerReminderRepository customAlignerReminderRepository;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Scheduling default cron jobs at startup.");
        scheduleDailyEventUpdatesCron();
        scheduleDailyNotificationsCron();
        scheduleDailyTenAMJob();
    }

    @PostConstruct
    public void init() {
        try {
            scheduler.start();
        } catch (SchedulerException e) {
            log.error("Failed to start the scheduler with error {}", e.getMessage());
        }
    }

    @Override
    public void scheduleReminder(final AlignerReminderInfo info) {
        var job = AlignerReminderInfo.toJobDetail(info);
        var trigger = AlignerReminderInfo.toTrigger(job);
        final String email = info.getEmail();

        try {
            log.info("Scheduling reminder for mobile no {}", email);
            scheduler.scheduleJob(job, trigger);
        } catch (SchedulerException e) {
            log.warn("Failed to schedule the reminder for mobile no {}", email, e);
        }
    }

    @Override
    public void rescheduleMissingAlignerReminderJobs(Long reminderId) {
        List<CustomAlignerReminder> customReminders = customAlignerReminderRepository.findAll();

        for (CustomAlignerReminder reminder : customReminders) {
            AlignerReminderInfo info = AlignerReminderInfo.from(reminder);
            String jobKey = info.reminderKey();

            try {
                if (scheduler.checkExists(JobKey.jobKey(jobKey, AlignerReminderInfo.ALIGNER_REMINDERS_GROUP))) {
                    log.info("Job {} already exists for reminder {}. Skipping...", jobKey, reminder.getId());
                    continue;
                }
                scheduleReminder(AlignerReminderInfo.from(reminder, 1));

                log.info("Successfully rescheduled reminder {} with job key {}", reminder.getId(), jobKey);
            } catch (SchedulerException e) {
                log.error("Failed to check or schedule job for reminder {}: {}", reminder.getId(), e.getMessage());
            }
        }
    }

    @Override
    public void scheduleDailyTenAMJob() {
        // Ensure the DailyTenAMJob bean is fully initialized
        applicationContext.getBean(DailyTenAMJob.class);

        var jobDetails = DailyTenAMJob.toJobDetails();
        var trigger = DailyTenAMJob.toTrigger();
        var jobKey = DailyTenAMJob.jobKey();

        try {
            if (!scheduler.checkExists(DailyTenAMJob.jobKey())) {
                scheduler.scheduleJob(jobDetails, trigger);
                log.info("Scheduled the daily 10 AM job.");
            }
        } catch (SchedulerException e) {
            log.warn("Failed to schedule the daily 10 AM job", e);
        }
    }

    @Override
    public void scheduleReminder(final Reminder reminder) {
        var reminderId = reminder.getId();
        var job = ReminderJob.newJobDetail(reminder);
        var trigger = ReminderJob.toTrigger(job);

        try {
            scheduler.scheduleJob(job, trigger);
            log.info("Scheduled the reminder with id {}", reminderId);
        } catch (SchedulerException e) {
            log.warn("Failed to schedule the reminder with id {}", reminderId, e);
        }
    }

    @Override
    public void deleteReminder(final Reminder reminder) {
        try {
            scheduler.deleteJob(reminder.jobKey());
        } catch (SchedulerException e) {
            log.error("Failed to delete job for reminder {}", reminder.getId(), e);
        }
    }

    @Override
    public void scheduleDailyEventUpdatesCron() {
        var jobDetails = DailyEventsUpdateCronJob.toJobDetails();
        var trigger = DailyEventsUpdateCronJob.toTrigger();

        try {
            if (!scheduler.checkExists(DailyEventsUpdateCronJob.jobKey())) {
                log.info("Scheduling daily events update cron job.");
                scheduler.scheduleJob(jobDetails, trigger);
            }
        } catch (SchedulerException e) {
            log.warn("Failed to schedule the daily events update cron", e);
        }
    }

    @Override
    public boolean reminderExists(DefaultAlignerReminder reminder) {
        var key = AlignerReminderInfo.reminderKey(reminder);
        if (key == null) {
            return false;
        }

        try {
            return scheduler.checkExists(key);
        } catch (SchedulerException e) {
            log.warn("Failed to check if reminder job with key {} exists", key.toString());
            return false;
        }
    }

    @Override
    public void scheduleDailyNotificationsCron() {
        var jobDetails = DailyNotificationsCronJob.toJobDetails();
        var trigger = DailyNotificationsCronJob.toTrigger();

        try {
            if (!scheduler.checkExists(DailyNotificationsCronJob.jobKey())) {
                scheduler.scheduleJob(jobDetails, trigger);
                log.info("Scheduled the daily notifications cron job.");
            }
        } catch (SchedulerException e) {
            log.warn("Failed to schedule the daily notifications cron", e);
        }
    }

    @Override
    public void scheduleDefaultReminderForCurrentAligner(DefaultAlignerReminder reminder) {
        var alignerJourney = reminder.getAlignerJourney();
        var currentAligner = alignerJourney.getCurrentAligner();
        if (alignerJourney.getProgressStatus().equals(ProgressStatus.DEACTIVATED)) {
            return;
        }
        if (currentAligner == null) {
            throw new BadRequestException("Current aligner is not set.");
        }

        scheduleDefaultReminder(reminder, currentAligner);
    }

    @Override
    public void scheduleDefaultReminder(DefaultAlignerReminder reminder, @NotNull Aligner currentAligner) {
        var alignerJourney = reminder.getAlignerJourney();
        var nextAlignerNo = currentAligner.getSrNo() + 1;
        if (alignerJourney.getProgressStatus().equals(ProgressStatus.DEACTIVATED)) {
            return;
        }
        if (nextAlignerNo > alignerJourney.getAligners().size()) {
            return;
        }

        var alignerJourneyId = alignerJourney.getId();
        var patient = alignerJourney.getPatient();
        var mobileNo = patient.getMobileNo();
        var firstName = patient.getFirstName();
        var reminderId = reminder.getId();

        String message;
        String title;
        int notificationIndex;
        var tracking = alignerJourney.getTracking();
        if (tracking != null && !tracking.getTrackingType().equals(TrackingType.MANUAL)) {
            if (reminder.getType().equals(DefaultAlignerReminderType.ALIGNER_CHANGE_DATE)) {
                title = String.format("Kudos! Time to change to Aligner %s", nextAlignerNo);
                message = String.format(
                        "Great job, %s. Remember, each Aligner brings you closer to your desired results. Keep up the fantastic progress.",
                        firstName);
                notificationIndex = 19;
            } else {
                title = String.format("Big day tomorrow! Change to Aligner %s!", nextAlignerNo);
                message = "Tap to review your progress so far.";
                notificationIndex = 20;
            }
            var reminderInfo = AlignerReminderInfo.builder()
                    .alignerJourneyId(alignerJourneyId)
                    .alignerSrNo(nextAlignerNo)
                    .reminderId(reminderId)
                    .reminderType(ReminderType.DEFAULT)
                    .frequency(Frequency.ONE_TIME)
                    .date(reminder.changeDate(currentAligner))
                    .time(reminder.getTime())
                    .email(patient.getEmail())
                    .message(message)
                    .title(title)
                    .notificationIndex(notificationIndex)
                    .build();
            scheduleReminder(reminderInfo);
        }
    }

    @Override
    public void deleteCustomReminder(CustomAlignerReminder reminder) {
        try {
            scheduler.deleteJob(JobKey.jobKey(AlignerReminderInfo.reminderKey(reminder), ALIGNER_REMINDERS_GROUP));
        } catch (SchedulerException e) {
            log.error("Failed to delete job for reminder {}", reminder.getId(), e);
        }
    }

    @Override
    public void deleteDefaultReminders(DefaultAlignerReminder reminder) {
        var alignerJourney = reminder.getAlignerJourney();
        var reminderId = reminder.getId();
        var aligners = alignerJourney.getAligners().stream()
                .sorted(Comparator.comparing(Aligner::getSrNo))
                .toList();
        for (var a : aligners) {
            try {
                var key = AlignerReminderInfo.reminderKey(reminder, a);
                scheduler.deleteJob(JobKey.jobKey(key, ALIGNER_REMINDERS_GROUP));
            } catch (SchedulerException e) {
                log.error("Failed to delete the default reminder with id {}", reminderId, e);
            }
        }
    }

    @PreDestroy
    public void preDestroy() {
        try {
            scheduler.shutdown();
        } catch (SchedulerException e) {
            log.error("Failed to destroy the scheduler with error {}", e.getMessage());
        }
    }
}
