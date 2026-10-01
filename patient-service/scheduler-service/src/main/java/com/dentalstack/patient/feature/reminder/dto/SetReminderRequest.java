package com.dentalstack.patient.feature.reminder.dto;

import com.dentalstack.patient.feature.reminder.enums.Frequency;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SetReminderRequest {
    private Long alignerJourneyId;
    private String name;

    @Nullable
    private LocalDate date;

    @Schema(implementation = String.class, pattern = "HH:mm:SS")
    private LocalTime time;

    private Frequency frequency;

    @Builder.Default
    private int messageIndex = 1;

    public static SetReminderRequest from(Long alignerJourneyId, String name, LocalTime time, Frequency frequency) {
        return SetReminderRequest.builder()
                .alignerJourneyId(alignerJourneyId)
                .name(name)
                .frequency(frequency)
                .date(LocalDate.now())
                .time(time)
                .build();
    }
}
