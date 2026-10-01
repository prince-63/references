package com.dentalstack.patient.feature.aligner.service.logs.impl;

import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.DailyWearTimeLogEntry;
import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.DailyWearTimeLogsResponse;
import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.PaginationInfo;
import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.WearTimeSession;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.logs.AlignerWearTimeSession;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.logs.ActiveSessionExistsException;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.action.AlignerRepository;
import com.dentalstack.patient.feature.aligner.repository.logs.AlignerWearTimeSessionRepository;
import com.dentalstack.patient.feature.aligner.service.logs.AlignerWearTimeLogsService;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlignerWearTimeLogsServiceImpl implements AlignerWearTimeLogsService {

    private final AlignerWearTimeSessionRepository sessionRepository;
    private final AlignerJourneyRepository alignerJourneyRepository;
    private final AlignerRepository alignerRepository;

    @Transactional
    @Override
    public void startSession(Long alignerJourneyId, Long alignerId) {
        AlignerJourney journey = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        Aligner aligner =
                alignerRepository.findById(alignerId).orElseThrow(() -> new AlignerNotFoundException(alignerId));

        sessionRepository.findActiveSessionByAlignerJourneyId(alignerJourneyId).ifPresent(session -> {
            throw new ActiveSessionExistsException(
                    "Active session already exists for aligner journey ID: " + alignerJourneyId);
        });

        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        AlignerWearTimeSession session = AlignerWearTimeSession.builder()
                .alignerJourney(journey)
                .aligner(aligner)
                .date(currentDate)
                .startTime(currentTime)
                .status(AlignerWearTimeSession.SessionStatus.ACTIVE)
                .build();

        sessionRepository.save(session);
    }

    @Transactional
    @Override
    public void stopSession(Long alignerJourneyId) {
        AlignerWearTimeSession activeSession = sessionRepository
                .findActiveSessionByAlignerJourneyId(alignerJourneyId)
                .orElseThrow(
                        () -> new RuntimeException("No active session found for aligner journey: " + alignerJourneyId));

        completeSession(activeSession);
    }

    @Transactional
    public void completeSession(AlignerWearTimeSession session) {
        LocalTime endTime = LocalTime.now();
        LocalDate sessionDate = session.getDate();
        LocalDate currentDate = LocalDate.now();

        if (!currentDate.equals(sessionDate)) {
            session.setEndTime(LocalTime.of(23, 59, 59));
            session.calculateDuration();
            session.setStatus(AlignerWearTimeSession.SessionStatus.COMPLETED);
            sessionRepository.save(session);

            long remainingSeconds =
                    Duration.between(LocalTime.MIDNIGHT, endTime).getSeconds();
            if (remainingSeconds > 0) {
                AlignerWearTimeSession nextDaySession = AlignerWearTimeSession.builder()
                        .alignerJourney(session.getAlignerJourney())
                        .aligner(session.getAligner())
                        .date(currentDate)
                        .startTime(LocalTime.MIDNIGHT)
                        .endTime(endTime)
                        .status(AlignerWearTimeSession.SessionStatus.COMPLETED)
                        .build();
                nextDaySession.calculateDuration();
                sessionRepository.save(nextDaySession);
                return;
            }
            return;
        }

        session.setEndTime(endTime);
        session.setStatus(AlignerWearTimeSession.SessionStatus.COMPLETED);
        session.calculateDuration();
    }

    @Override
    public List<AlignerWearTimeSession> getDailySessions(Long alignerJourneyId, LocalDate date) {
        return sessionRepository.findByAlignerJourneyIdAndDate(alignerJourneyId, date);
    }

    @Override
    public boolean hasActiveSession(Long alignerJourneyId) {
        return sessionRepository
                .findActiveSessionByAlignerJourneyId(alignerJourneyId)
                .isPresent();
    }

    @Override
    public DailyWearTimeLogsResponse getDailyWearTimeLogs(
            Long alignerJourneyId, int page, int size, LocalDate fromDate, LocalDate toDate) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AlignerWearTimeSession> sessionsPage;

        if (fromDate != null && toDate != null) {
            sessionsPage =
                    sessionRepository.findByAlignerJourneyIdAndDateRange(alignerJourneyId, fromDate, toDate, pageable);
        } else {
            sessionsPage = sessionRepository.findByAlignerJourneyId(alignerJourneyId, pageable);
        }

        Map<LocalDate, List<AlignerWearTimeSession>> sessionsByDate =
                sessionsPage.getContent().stream().collect(Collectors.groupingBy(AlignerWearTimeSession::getDate));

        List<DailyWearTimeLogEntry> logEntries = sessionsByDate.entrySet().stream()
                .map(entry -> convertToLogEntry(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(DailyWearTimeLogEntry::getDate).reversed())
                .collect(Collectors.toList());

        PaginationInfo paginationInfo = PaginationInfo.builder()
                .page(page)
                .size(size)
                .totalElements(sessionsPage.getTotalElements())
                .totalPages(sessionsPage.getTotalPages())
                .hasNext(sessionsPage.hasNext())
                .hasPrevious(sessionsPage.hasPrevious())
                .build();

        return DailyWearTimeLogsResponse.builder()
                .logs(logEntries)
                .pagination(paginationInfo)
                .build();
    }

    private DailyWearTimeLogEntry convertToLogEntry(LocalDate date, List<AlignerWearTimeSession> sessions) {
        long totalDuration = sessions.stream()
                .filter(s -> s.getDurationSecs() != null)
                .mapToLong(AlignerWearTimeSession::getDurationSecs)
                .sum();

        List<WearTimeSession> wearTimeSessions = sessions.stream()
                .filter(s -> s.getDurationSecs() != null && s.isCompleted())
                .map(this::convertToWearTimeSession)
                .collect(Collectors.toList());

        return DailyWearTimeLogEntry.builder()
                .date(date)
                .totalDurationSecs(totalDuration)
                .sessions(wearTimeSessions)
                .build();
    }

    private WearTimeSession convertToWearTimeSession(AlignerWearTimeSession session) {
        return WearTimeSession.builder()
                .inTime(session.getStartTime())
                .outTime(session.getEndTime())
                .durationSecs(session.getDurationSecs())
                .build();
    }
}
