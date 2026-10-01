package com.dentalstack.patient.feature.reminder.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAlignerProductionReminderRequest {
    private long alignerJourneyId;
    private long reminderId;
    private LocalDate date;
}
