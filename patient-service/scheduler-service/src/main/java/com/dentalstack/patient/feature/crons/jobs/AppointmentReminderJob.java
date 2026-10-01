package com.dentalstack.patient.feature.crons.jobs;

import com.dentalstack.patient.feature.appointment.service.AppointmentService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@DisallowConcurrentExecution
public class AppointmentReminderJob implements Job {

    private final AppointmentService appointmentService;

    public AppointmentReminderJob(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        log.info("Executing appointment reminder job");
        appointmentService.todayAppointmentReminder();
    }
}
