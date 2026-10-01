package com.dentalstack.patient.feature.aligner.repository.logs;

import com.dentalstack.patient.feature.aligner.entity.logs.AlignerWearTimeSession;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerWearTimeSessionRepository extends JpaRepository<AlignerWearTimeSession, Long> {

    @Query("SELECT s FROM AlignerWearTimeSession s WHERE s.alignerJourney.id = :alignerJourneyId "
            + "AND s.date BETWEEN :fromDate AND :toDate ORDER BY s.date DESC, s.startTime DESC")
    Page<AlignerWearTimeSession> findByAlignerJourneyIdAndDateRange(
            @Param("alignerJourneyId") Long alignerJourneyId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);

    @Query("SELECT s FROM AlignerWearTimeSession s WHERE s.alignerJourney.id = :alignerJourneyId "
            + "ORDER BY s.date DESC, s.startTime DESC")
    Page<AlignerWearTimeSession> findByAlignerJourneyId(
            @Param("alignerJourneyId") Long alignerJourneyId, Pageable pageable);

    List<AlignerWearTimeSession> findByAlignerJourneyIdAndDate(
            @Param("alignerJourneyId") Long alignerJourneyId, @Param("date") LocalDate date);

    @Query("SELECT s FROM AlignerWearTimeSession s WHERE s.alignerJourney.id = :alignerJourneyId "
            + "AND s.status = 'ACTIVE' ORDER BY s.startTime DESC")
    Optional<AlignerWearTimeSession> findActiveSessionByAlignerJourneyId(
            @Param("alignerJourneyId") Long alignerJourneyId);
}
