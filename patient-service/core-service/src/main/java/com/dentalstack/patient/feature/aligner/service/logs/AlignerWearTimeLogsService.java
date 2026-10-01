package com.dentalstack.patient.feature.aligner.service.logs;

import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.DailyWearTimeLogsResponse;
import com.dentalstack.patient.feature.aligner.entity.logs.AlignerWearTimeSession;
import java.time.LocalDate;
import java.util.List;

public interface AlignerWearTimeLogsService {
    void startSession(Long alignerJourneyId, Long alignerId);

    void stopSession(Long alignerJourneyId);

    void completeSession(AlignerWearTimeSession session);

    List<AlignerWearTimeSession> getDailySessions(Long alignerJourneyId, LocalDate date);

    boolean hasActiveSession(Long alignerJourneyId);

    DailyWearTimeLogsResponse getDailyWearTimeLogs(
            Long alignerJourneyId, int page, int size, LocalDate fromDate, LocalDate toDate);
}
