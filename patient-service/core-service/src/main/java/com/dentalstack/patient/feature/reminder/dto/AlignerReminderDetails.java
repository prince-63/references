package com.dentalstack.patient.feature.reminder.dto;

import com.dentalstack.patient.feature.aligner.entity.CustomAlignerReminder;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerReminderDetails {
    private String name;
    private LocalDate date;
    private LocalTime time;
    private Frequency frequency;

    public static AlignerReminderDetails from(CustomAlignerReminder reminder) {
        return AlignerReminderDetails.builder()
                .name(reminder.getName())
                .date(reminder.getDate())
                .time(reminder.getTime())
                .frequency(reminder.getFrequency())
                .build();
    }
}
