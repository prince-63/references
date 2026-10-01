package com.dentalstack.patient.feature.reminder.entity;

import com.dentalstack.patient.feature.reminder.enums.ReminderTriggeredLogEnum;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "reminder_triggered_log")
public class ReminderTriggeredLog extends BaseEntity {

    private long alignerJourneyId;

    @Enumerated(EnumType.STRING)
    private ReminderStatus status;

    private LocalDate triggeredAt;

    @Enumerated(EnumType.STRING)
    private ReminderTriggeredLogEnum reminderTriggeredLogEnum;

    public static ReminderTriggeredLog from(
            long alignerJourneyId, ReminderStatus reminderStatus, ReminderTriggeredLogEnum reminderTriggeredLogEnum) {
        return ReminderTriggeredLog.builder()
                .alignerJourneyId(alignerJourneyId)
                .status(reminderStatus)
                .triggeredAt(LocalDate.now())
                .reminderTriggeredLogEnum(reminderTriggeredLogEnum)
                .build();
    }
}
