package com.dentalstack.patient.feature.aligner.repository;

import com.dentalstack.patient.feature.aligner.entity.CustomAlignerReminder;
import com.dentalstack.patient.feature.reminder.dto.CustomAlignerReminderSummary;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomAlignerReminderRepository extends JpaRepository<CustomAlignerReminder, Long> {
    Optional<CustomAlignerReminder> findByNameAndDateAndTimeAndAlignerJourneyIdAndFrequency(
            String name, LocalDate date, LocalTime time, Long alignerJourneyId, Frequency frequency);

    Optional<CustomAlignerReminder> findByNameAndDateAndTimeAndAlignerJourneyId(
            String name, LocalDate date, LocalTime time, Long alignerJourneyId);

    void deleteAllByAlignerJourneyId(Long id);

    @Query(
            """
        SELECT
            car.id AS id,
            car.alignerJourney.id AS alignerJourneyId,
            car.date AS date,
            car.time AS time,
            car.frequency AS frequency,
            CASE
                WHEN car.alignerJourney.patient.email IS NOT NULL
                THEN car.alignerJourney.patient.email
                ELSE NULL
            END AS email
        FROM CustomAlignerReminder car
        WHERE car.active = true
        ORDER BY car.id
    """)
    Slice<CustomAlignerReminderSummary> findAllBy(Pageable pageable);
}
