package com.dentalstack.patient.feature.aligner.repository;

import com.dentalstack.patient.feature.aligner.entity.DefaultAlignerReminder;
import com.dentalstack.patient.feature.reminder.enums.DefaultAlignerReminderType;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DefaultAlignerReminderRepository extends JpaRepository<DefaultAlignerReminder, Long> {
    Optional<DefaultAlignerReminder> findByNameAndAlignerJourneyIdAndTypeAndTime(
            String name, Long alignerJourneyId, DefaultAlignerReminderType type, LocalTime time);

    List<DefaultAlignerReminder> findByAlignerJourneyId(Long alignerJourneyId);

    void deleteAllByAlignerJourneyId(Long id);
}
