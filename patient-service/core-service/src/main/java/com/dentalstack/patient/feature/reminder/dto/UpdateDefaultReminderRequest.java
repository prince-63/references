package com.dentalstack.patient.feature.reminder.dto;

import com.dentalstack.patient.feature.reminder.enums.DefaultAlignerReminderType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateDefaultReminderRequest {
    private Long alignerJourneyId;
    private Long defaultReminderId;

    private DefaultAlignerReminderType type;

    private String name;

    @Schema(implementation = String.class, pattern = "HH:mm:SS")
    private LocalTime time;
}
