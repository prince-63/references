package com.dentalstack.patient.feature.calendar.dto.calendar.details;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TreatmentPausedCalendarDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String reasonForPausing;
    private LocalDate pausedAt;
    private String patientName;
    private String profileUrl;
    private long patientId;
    private LocalDate resumeDate;
    private Long alignerJourneyId;

    public static TreatmentPausedCalendarDetails from(
            String reasonForPausing,
            String patientName,
            String profileUrl,
            LocalDate pausedAt,
            LocalDate resumeDate,
            long patientId,
            Long alignerJourneyId) {
        return TreatmentPausedCalendarDetails.builder()
                .reasonForPausing(reasonForPausing)
                .patientName(patientName)
                .pausedAt(pausedAt)
                .profileUrl(profileUrl)
                .patientId(patientId)
                .resumeDate(resumeDate)
                .alignerJourneyId(alignerJourneyId)
                .build();
    }
}
