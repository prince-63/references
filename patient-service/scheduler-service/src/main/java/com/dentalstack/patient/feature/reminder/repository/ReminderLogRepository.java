package com.dentalstack.patient.feature.reminder.repository;

import com.dentalstack.patient.feature.reminder.entity.ReminderTriggeredLog;
import com.dentalstack.patient.feature.reminder.enums.ReminderTriggeredLogEnum;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReminderLogRepository extends JpaRepository<ReminderTriggeredLog, Long> {

    boolean existsByReminderTriggeredLogEnumAndTriggeredAt(
            ReminderTriggeredLogEnum reminderTriggeredLogEnum, LocalDate triggeredAt);

    boolean existsByReminderTriggeredLogEnumAndTriggeredAtAndAlignerJourneyId(
            ReminderTriggeredLogEnum reminderTriggeredLogEnum, LocalDate triggeredAt, Long alignerJourneyId);
}
