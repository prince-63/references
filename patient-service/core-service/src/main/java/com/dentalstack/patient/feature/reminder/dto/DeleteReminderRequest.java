package com.dentalstack.patient.feature.reminder.dto;

import com.dentalstack.patient.feature.reminder.enums.ReminderCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeleteReminderRequest {
    private Long alignerJourneyId;
    private long reminderId;
    private Long patientId;
    private ReminderCategory reminderCategory;
}
