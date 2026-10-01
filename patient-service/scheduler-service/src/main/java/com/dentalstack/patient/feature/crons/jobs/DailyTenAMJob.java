package com.dentalstack.patient.feature.crons.jobs;

import com.dentalstack.patient.feature.treatment.service.AlignerService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DailyTenAMJob implements Job {

    public static final String DAILY_TEN_AM_JOB_KEY = "daily_ten_am_job";
    public static final String DAILY_JOB_GROUP = "daily_job_group";
    public static String DAILY_TEN_AM_CRON;

    @Autowired
    private AlignerService alignerService;

    @Value("${app.cron.daily-ten-am}")
    public void setCronExpression(String cronExpression) {
        DAILY_TEN_AM_CRON = cronExpression;
    }

    @Override
    public void execute(JobExecutionContext context) {
        log.info("Executing manual aligner change notification job");
        alignerService.processAlignerChanges();
    }

    public static JobDetail toJobDetails() {
        return JobBuilder.newJob(DailyTenAMJob.class)
                .withIdentity(jobKey())
                .storeDurably()
                .build();
    }

    public static Trigger toTrigger() {
        CronScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(DAILY_TEN_AM_CRON);
        return TriggerBuilder.newTrigger()
                .forJob(jobKey())
                .withIdentity(triggerKey())
                .withSchedule(scheduleBuilder)
                .startNow()
                .build();
    }

    public static JobKey jobKey() {
        return JobKey.jobKey(DAILY_TEN_AM_JOB_KEY, DAILY_JOB_GROUP);
    }

    public static TriggerKey triggerKey() {
        return TriggerKey.triggerKey(DAILY_TEN_AM_JOB_KEY, DAILY_JOB_GROUP);
    }
}
