package com.dentalstack.patient.feature.appointment.dto;

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
public class AppointmentReminderDetails {

    private LocalDate date;
    private LocalTime time;

    private Status status;

    private long reminderId;

    public enum Status {
        OVERDUE,
        UPCOMING
    }
}
