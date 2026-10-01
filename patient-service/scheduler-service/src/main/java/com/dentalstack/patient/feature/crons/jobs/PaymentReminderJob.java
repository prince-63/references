package com.dentalstack.patient.feature.crons.jobs;

import com.dentalstack.patient.feature.billing.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@DisallowConcurrentExecution
public class PaymentReminderJob implements Job {

    private final PaymentService paymentService;

    public PaymentReminderJob(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        log.info("Executing payment reminder job");
        paymentService.paymentReminder();
    }
}
