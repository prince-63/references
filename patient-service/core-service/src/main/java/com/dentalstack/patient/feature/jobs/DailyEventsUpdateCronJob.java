package com.dentalstack.patient.feature.jobs;

import static org.quartz.TriggerKey.triggerKey;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.OrderStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.CreationStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerProductionOrderReminderEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.NotWearingForRecommendedHoursEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.TreatmentStartingEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.time.LocalDate;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DailyEventsUpdateCronJob implements Job {

    public static final String DAILY_EVENTS_UPDATE_CRON_JOB_KEY = "daily_events_update_cron";

    public static final String EVENTS_CRON_GROUP = "events_cron";

    public static String DAILY_UPDATE_CRON;

    @Value("${app.cron.daily-events}")
    private String cronExpression;

    @Value("${app.cron.daily-events}")
    public void setCronExpression(String cronExpression) {
        DAILY_UPDATE_CRON = cronExpression;
    }

    @Lazy
    @Autowired
    private TimelineService timelineService;

    @Lazy
    @Autowired
    private AlignerJourneyRepository alignerJourneyRepository;

    @Lazy
    @Autowired
    private ReminderRepository reminderRepository;

    @Override
    public void execute(JobExecutionContext context) {
        alignerJourneyRepository
                .findByCreationStatusAndProgressStatus(CreationStatus.DONE, ProgressStatus.IN_PROGRESS)
                .forEach(alignerJourney -> {
                    var patient = alignerJourney.getPatient();

                    complianceRelatedEvents(alignerJourney, patient);
                    treatmentStartingEvents(alignerJourney, patient);
                    alignerProductionOrderReminderEvents(alignerJourney);
                });
        log.info("Scheduled the events update cron.");
    }

    private void alignerProductionOrderReminderEvents(AlignerJourney alignerJourney) {
        var patient = alignerJourney.getPatient();
        var today = LocalDate.now();

        alignerJourney.getAlignerProductionOrders().stream()
                .filter(order -> order.getStatus().equals(OrderStatus.ACTIVE))
                .flatMap(order -> order.getReminders().stream())
                .filter(reminder -> {
                    if (!reminder.getStatus().equals(ReminderStatus.ACTIVE)) return false;
                    assert reminder.getDate() != null;
                    return reminder.getDate().equals(today);
                })
                .forEach(reminder -> {
                    timelineService.addEvent(
                            alignerJourney.getDoctorId(),
                            UserType.DOCTOR,
                            patient.getId(),
                            UserType.PATIENT,
                            EventType.ALIGNER_PRODUCTION_ORDER_REMINDER,
                            new AlignerProductionOrderReminderEventMetadata(
                                    AlignerJourneyDetails.from(alignerJourney), PatientDetails.from(patient)));

                    reminder.setStatus(ReminderStatus.TRIGGERED);

                    reminderRepository.save(reminder);
                });
    }

    private void complianceRelatedEvents(AlignerJourney alignerJourney, Patient patient) {
        Aligner currentAligner = alignerJourney.getCurrentAligner();
        if (currentAligner == null || currentAligner.getEndDate() == null) return;

        Compliance compliance = currentAligner.compliance();
        if (compliance == null) return;

        long fourthJourney = Math.floorDiv(currentAligner.totalDaysToWear(), 4);
        long noOfDaysWorn = currentAligner.noOfDaysWorn(false, true, false);
        float avgWearTimeInSecs = Optional.ofNullable(currentAligner.avgWearTimeInSecs(true, true))
                .orElse(0f);

        if (compliance == Compliance.POOR
                && (noOfDaysWorn == fourthJourney
                        || noOfDaysWorn == 2 * fourthJourney
                        || currentAligner.dayRemaining() == 2)) {
            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.NOT_WEARING_FOR_RECOMMENDED_HOURS,
                    new NotWearingForRecommendedHoursEventMetadata(
                            PatientDetails.from(patient),
                            currentAligner.getSrNo(),
                            avgWearTimeInSecs,
                            compliance,
                            noOfDaysWorn));
        }
    }

    private void treatmentStartingEvents(AlignerJourney alignerJourney, Patient patient) {
        var today = LocalDate.now();
        var treatmentStartDate = alignerJourney.getDoctorTreatmentStartDate();
        if (treatmentStartDate == null) return;

        if (patient.getDoctorId() != null && (treatmentStartDate.equals(today))) {
            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.TREATMENT_STARTING,
                    new TreatmentStartingEventMetadata(AlignerJourneyDetails.from(alignerJourney)));
        }
    }

    public static JobDetail toJobDetails() {
        return JobBuilder.newJob(DailyEventsUpdateCronJob.class)
                .withIdentity(JobKey.jobKey(key(), EVENTS_CRON_GROUP))
                .storeDurably()
                .build();
    }

    public static Trigger toTrigger() {
        var builder = CronScheduleBuilder.cronSchedule(DAILY_UPDATE_CRON);
        return TriggerBuilder.newTrigger()
                .forJob(JobKey.jobKey(key(), EVENTS_CRON_GROUP))
                .withIdentity(triggerKey(key(), EVENTS_CRON_GROUP))
                .withSchedule(builder)
                .startNow()
                .endAt(null)
                .build();
    }

    public static JobKey jobKey() {
        return JobKey.jobKey(key(), EVENTS_CRON_GROUP);
    }

    public static String key() {
        return DAILY_EVENTS_UPDATE_CRON_JOB_KEY + "_" + DAILY_UPDATE_CRON;
    }
}
