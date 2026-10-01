package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.CustomAlignerReminder;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.global.enums.language.Language;
import com.dentalstack.patient.global.utils.ReminderTranslationUtil;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomReminderDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long customReminderId;
    private String name;
    private LocalDate date;

    @Schema(implementation = String.class, pattern = "HH:mm:SS")
    private LocalTime time;

    private Frequency frequency;

    public static List<CustomReminderDetails> fromSorted(List<CustomAlignerReminder> reminders) {
        Language patientLanguage = reminders.isEmpty()
                ? Language.ENGLISH
                : reminders.get(0).getAlignerJourney().getPatient().getLanguage();

        return reminders.stream()
                .map(reminder -> from(reminder, patientLanguage))
                .sorted(Comparator.comparing(CustomReminderDetails::getTime))
                .collect(Collectors.toList());
    }

    public static CustomReminderDetails from(CustomAlignerReminder reminder, Language language) {
        return CustomReminderDetails.builder()
                .customReminderId(reminder.getId())
                .name(ReminderTranslationUtil.getTranslatedName(reminder.getName(), language))
                .date(reminder.getDate())
                .time(reminder.getTime())
                .frequency(reminder.getFrequency())
                .build();
    }
}
