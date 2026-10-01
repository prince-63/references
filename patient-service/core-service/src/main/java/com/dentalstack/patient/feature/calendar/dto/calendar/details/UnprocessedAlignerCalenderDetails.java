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
public class UnprocessedAlignerCalenderDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String patientName;
    private String profileUrl;
    private long reminderId;
    private Long patientId;
    private LocalDate date;
    private LocalTime time;
    private String title;
    private Long treatmentPlanId;

    public static UnprocessedAlignerCalenderDetails from(
            String patientName,
            String profileUrl,
            Long reminderId,
            Long patientId,
            LocalDate date,
            LocalTime time,
            String title,
            Long treatmentPlanId) {
        return UnprocessedAlignerCalenderDetails.builder()
                .patientName(patientName)
                .profileUrl(profileUrl)
                .reminderId(reminderId)
                .patientId(patientId)
                .date(date)
                .time(time)
                .title(title)
                .treatmentPlanId(treatmentPlanId)
                .build();
    }
}
