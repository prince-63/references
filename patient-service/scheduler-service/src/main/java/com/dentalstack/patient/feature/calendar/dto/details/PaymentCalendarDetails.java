package com.dentalstack.patient.feature.calendar.dto.details;

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
public class PaymentCalendarDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String notes;
    private String patientName;
    private String profileUrl;
    private long reminderId;
    private Float amount;
    private Long patientId;
    private LocalDate date;
    private LocalTime time;
    private String title;
    private Long alignerJourneyId;
}
