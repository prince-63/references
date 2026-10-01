package com.dentalstack.patient.feature.reminder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeleteCustomReminderRequest {
    private Long alignerJourneyId;
    private Long customReminderId;
}
