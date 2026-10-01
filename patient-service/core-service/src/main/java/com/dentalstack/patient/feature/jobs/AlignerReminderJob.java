package com.dentalstack.patient.feature.jobs;

import static com.dentalstack.patient.feature.jobs.AlignerReminderInfo.ALIGNER_REMINDER_INFO_KEY;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.CustomAlignerReminderRepository;
import com.dentalstack.patient.feature.aligner.repository.DefaultAlignerReminderRepository;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.reminder.enums.ReminderType;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.ReminderEventMetaData;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
public class AlignerReminderJob implements Job {

    @Lazy
    @Autowired
    private NotificationService notificationService;

    @Lazy
    @Autowired
    private CustomAlignerReminderRepository customAlignerReminderRepository;

    @Lazy
    @Autowired
    private DefaultAlignerReminderRepository defaultAlignerReminderRepository;

    @Lazy
    @Autowired
    private AlignerJourneyRepository alignerJourneyRepository;

    @Lazy
    @Autowired
    private TimelineService timelineService;

    @Lazy
    @Autowired
    private XOrganizationNameResolver xOrgNameResolver;

    @Lazy
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String LOCK_KEY_PREFIX = "aligner_reminder_lock:";
    private static final long LOCK_TIMEOUT = 5;

    @Override
    @Transactional
    public void execute(JobExecutionContext context) {
        JobDataMap jobDataMap = context.getJobDetail().getJobDataMap();
        AlignerReminderInfo info = (AlignerReminderInfo) jobDataMap.get(ALIGNER_REMINDER_INFO_KEY);
        String lockKey = LOCK_KEY_PREFIX + info.getAlignerJourneyId();

        try {
            Boolean acquired =
                    redisTemplate.opsForValue().setIfAbsent(lockKey, "locked", LOCK_TIMEOUT, TimeUnit.MINUTES);
            if (Boolean.TRUE.equals(acquired)) {
                processReminder(info);
            } else {
                log.info(
                        "Skipping reminder for aligner journey {} as it's being processed by another instance",
                        info.getAlignerJourneyId());
            }
        } catch (Exception e) {
            log.error("Failed to trigger reminder with key {}", info.reminderKey(), e);
        } finally {

            redisTemplate.delete(lockKey);
        }
    }

    private void processReminder(AlignerReminderInfo info) {
        alignerJourneyRepository.findByIdWithPatient(info.getAlignerJourneyId()).ifPresent(alignerJourney -> {
            if (alignerJourney.getProgressStatus().equals(ProgressStatus.DEACTIVATED)) {
                return;
            }

            if (info.getEmail() != null) {
                notificationService.notificationForAlignerChangeReminder(
                        alignerJourney,
                        SendNotificationRequest.builder()
                                .title(info.getTitle())
                                .message(info.getMessage())
                                .notificationIndex(info.getNotificationIndex())
                                .email(info.getEmail())
                                .xOrgName(xOrgNameResolver
                                        .resolveFromPatientId(
                                                alignerJourney.getPatient().getId())
                                        .getXOrgName())
                                .organizationId(xOrgNameResolver
                                        .resolveFromPatientId(
                                                alignerJourney.getPatient().getId())
                                        .getOrganizationId())
                                .build());

                timelineService.addEvent(
                        alignerJourney.getPatient().getId(),
                        UserType.PATIENT,
                        alignerJourney.getDoctorId(),
                        UserType.DOCTOR,
                        EventType.REMINDER,
                        new ReminderEventMetaData(AlignerJourneyDetails.from(alignerJourney)));
            } else {

            }

            if (info.getReminderType().equals(ReminderType.CUSTOM)
                    && info.getFrequency().equals(Frequency.ONE_TIME)) {
                deleteReminder(info);
            }
        });
    }

    private void deleteReminder(AlignerReminderInfo info) {
        var reminderType = info.getReminderType();
        var id = info.getReminderId();

        if (reminderType.equals(ReminderType.DEFAULT)) defaultAlignerReminderRepository.deleteById(id);
        else if (reminderType.equals(ReminderType.CUSTOM)) customAlignerReminderRepository.deleteById(id);
    }
}
