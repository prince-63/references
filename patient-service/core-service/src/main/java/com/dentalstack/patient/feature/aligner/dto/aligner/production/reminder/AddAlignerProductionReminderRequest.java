package com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddAlignerProductionReminderRequest {
    private LocalDate date;
    private long alignerJourneyId;
    private String notes;
    private Long organizationId;
    private Long profileId;
}
