package com.dentalstack.patient.feature.calendar.dto.calendar.details;

import java.io.Serial;
import java.io.Serializable;
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
public class ProductionReminderCalendarDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String notes;
    private String patientName;
    private String profileUrl;
    private Long reminderId;
    private long patientId;
    private LocalDate date;
    private LocalTime time;
    private String title;
    private Long alignerJourneyId;

    public static ProductionReminderCalendarDetails from(
            String notes,
            String patientName,
            String profileUrl,
            Long reminderId,
            Long patientId,
            LocalDate date,
            LocalTime time,
            String title,
            Long alignerJourneyId) {
        return ProductionReminderCalendarDetails.builder()
                .notes(notes)
                .patientName(patientName)
                .profileUrl(profileUrl)
                .reminderId(reminderId)
                .reminderId(reminderId)
                .patientId(patientId)
                .date(date)
                .time(time)
                .title(title)
                .alignerJourneyId(alignerJourneyId)
                .build();
    }
}
