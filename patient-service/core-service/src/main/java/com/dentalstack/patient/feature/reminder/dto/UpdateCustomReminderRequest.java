package com.dentalstack.patient.feature.reminder.dto;

import com.dentalstack.patient.feature.reminder.enums.Frequency;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateCustomReminderRequest {
    private Long alignerJourneyId;
    private Long customReminderId;

    private String name;
    private LocalDate date;

    @Schema(implementation = String.class, pattern = "HH:mm:SS")
    private LocalTime time;

    private Frequency frequency;
    private int messageIndex = 1;
}
