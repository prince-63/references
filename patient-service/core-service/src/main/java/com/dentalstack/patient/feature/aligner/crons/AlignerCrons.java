package com.dentalstack.patient.crons;

import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AlignerCrons {
    @Autowired
    private AlignerJourneyRepository alignerJourneyRepository;
}
