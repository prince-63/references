package com.dentalstack.patient.feature.treatment_insights.service;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.treatment_insights.dto.InsightCard;
import com.dentalstack.patient.feature.treatment_insights.dto.InsightResponse;
import com.dentalstack.patient.feature.treatment_insights.entity.TreatmentDayInsight;
import com.dentalstack.patient.feature.treatment_insights.repository.TreatmentDayInsightRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TreatmentInsightService {

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final TreatmentDayInsightRepository insightRepository;

    private static final String STANDARD_TITLE = "You're doing great.";
    private static final String STANDARD_DESC = "Your aligners are working steadily with consistent wear. "
            + "Stick to your routine and follow your change schedule for best results.";
    private static final int MAX_CONFIGURED_INSIGHT_DAY = 30;

    public InsightResponse getInsights(Long patientId) {
        AlignerJourney alignerJourney = alignerJourneyRepository.findInProgressAlignerJourney(patientId).stream()
                .findFirst()
                .orElseThrow(
                        () -> new RuntimeException("Active aligner journey not found for patient ID: " + patientId));

        Integer alignerNo = alignerJourney.getCurrentAlignerNo();

        Optional<Aligner> currentAlignerDetails = alignerJourney.getAligners().stream()
                .filter(aligner -> aligner.getSrNo() == alignerNo)
                .findFirst();

        return currentAlignerDetails
                .map(a -> {
                    LocalDate currentAlignerStartDate = a.getStartDate();

                    if (currentAlignerStartDate == null) {
                        throw new RuntimeException("Treatment start date not set for patient ID: " + patientId);
                    }

                    long today = ChronoUnit.DAYS.between(currentAlignerStartDate, LocalDate.now()) + 1;

                    if (today <= 0) {
                        today = 1;
                    }

                    if (today > MAX_CONFIGURED_INSIGHT_DAY) {
                        InsightCard standardCard = new InsightCard(null, STANDARD_TITLE, STANDARD_DESC, true);
                        return InsightResponse.builder()
                                .treatmentDay(today)
                                .cards(List.of(standardCard))
                                .standardMessage(true)
                                .build();
                    }

                    int startDay = (int) today;
                    int endDay = Math.min(startDay + 2, MAX_CONFIGURED_INSIGHT_DAY);

                    if (startDay > endDay) {
                        InsightCard standardCard = new InsightCard(null, STANDARD_TITLE, STANDARD_DESC, true);
                        return InsightResponse.builder()
                                .treatmentDay(today)
                                .cards(List.of(standardCard))
                                .standardMessage(true)
                                .build();
                    }

                    List<TreatmentDayInsight> insights =
                            insightRepository.findByDayNumberBetweenOrderByDayNumberAsc(startDay, endDay);

                    if (insights.isEmpty()) {
                        InsightCard standardCard = new InsightCard(null, STANDARD_TITLE, STANDARD_DESC, true);
                        return InsightResponse.builder()
                                .treatmentDay(today)
                                .cards(List.of(standardCard))
                                .standardMessage(true)
                                .build();
                    }

                    List<InsightCard> cards = insights.stream()
                            .map(insight -> new InsightCard(
                                    insight.getDayNumber(),
                                    insight.getTitle(),
                                    insight.getDescription(),
                                    insight.getDayNumber().equals(startDay)))
                            .toList();

                    return InsightResponse.builder()
                            .treatmentDay(today)
                            .standardMessage(false)
                            .cards(cards)
                            .build();
                })
                .orElseGet(() -> InsightResponse.builder().build());
    }
}
