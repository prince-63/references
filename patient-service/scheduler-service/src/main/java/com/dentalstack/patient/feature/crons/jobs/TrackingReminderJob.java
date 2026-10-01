package com.dentalstack.patient.feature.crons.jobs;

import com.dentalstack.patient.feature.tracking.service.TrackingService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@DisallowConcurrentExecution
public class TrackingReminderJob implements Job {

    private final TrackingService trackingService;

    public TrackingReminderJob(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        log.info("Executing tracking reminder job");
        trackingService.reminderForPausedTreatment();
        trackingService.refinementReminder();
        trackingService.reminderForResumeTreatment();
    }
}
