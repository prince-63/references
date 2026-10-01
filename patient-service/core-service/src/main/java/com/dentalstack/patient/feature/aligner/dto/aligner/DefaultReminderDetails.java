package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.DefaultAlignerReminder;
import com.dentalstack.patient.feature.reminder.enums.DefaultAlignerReminderType;
import com.dentalstack.patient.global.enums.language.Language;
import com.dentalstack.patient.global.utils.ReminderTranslationUtil;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DefaultReminderDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long defaultReminderId;
    private String name;
    private DefaultAlignerReminderType frequency;
    private LocalTime time;

    public static List<DefaultReminderDetails> fromSorted(List<DefaultAlignerReminder> reminders) {
        Language patientLanguage = reminders.isEmpty()
                ? Language.ENGLISH
                : reminders.get(0).getAlignerJourney().getPatient().getLanguage();

        return reminders.stream()
                .map(reminder -> from(reminder, patientLanguage))
                .sorted(Comparator.comparing(DefaultReminderDetails::getTime))
                .collect(Collectors.toList());
    }

    public static DefaultReminderDetails from(DefaultAlignerReminder reminder, Language language) {
        return DefaultReminderDetails.builder()
                .defaultReminderId(reminder.getId())
                .name(ReminderTranslationUtil.getTranslatedName(reminder.getName(), language))
                .time(reminder.getTime())
                .build();
    }
}
