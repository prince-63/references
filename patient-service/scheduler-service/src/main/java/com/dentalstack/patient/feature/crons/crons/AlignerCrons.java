package com.dentalstack.patient.feature.crons.crons;

import com.dentalstack.patient.feature.treatment.enums.CreationStatus;
import com.dentalstack.patient.feature.treatment.enums.ProgressStatus;
import com.dentalstack.patient.feature.treatment.repository.AlignerJourneyRepository;
import java.time.LocalDate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AlignerCrons {
    @Autowired
    private AlignerJourneyRepository alignerJourneyRepository;

    @Scheduled(cron = "0 10 0 * * ?")
    public void startTreatmentsOfToday() {
        var today = LocalDate.now();
        alignerJourneyRepository
                .findByDoctorTreatmentStartDateAndCreationStatus(today, CreationStatus.DONE)
                .forEach(alignerJourney -> {
                    alignerJourney.setProgressStatus(ProgressStatus.IN_PROGRESS);
                    alignerJourneyRepository.save(alignerJourney);
                });
        log.info("Started all today's treatments.");
    }
}
