package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.treatment.entity.CustomAlignerReminder;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomAlignerReminderRepository extends JpaRepository<CustomAlignerReminder, Long> {
    Optional<CustomAlignerReminder> findByNameAndDateAndTimeAndAlignerJourneyIdAndFrequency(
            String name, LocalDate date, LocalTime time, Long alignerJourneyId, Frequency frequency);
}
