package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.reminder.enums.DefaultAlignerReminderType;
import com.dentalstack.patient.feature.treatment.entity.DefaultAlignerReminder;
import java.time.LocalTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DefaultAlignerReminderRepository extends JpaRepository<DefaultAlignerReminder, Long> {
    Optional<DefaultAlignerReminder> findByNameAndAlignerJourneyIdAndTypeAndTime(
            String name, Long alignerJourneyId, DefaultAlignerReminderType type, LocalTime time);
}
