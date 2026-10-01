package com.dentalstack.patient.feature.reminder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeleteAlignerProductionReminderRequest {
    private long alignerJourneyId;
    private long reminderId;
}
