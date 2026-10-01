package com.dentalstack.patient.feature.appointment.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAppointmentReminderRequest {

    private long reminderId;
    private LocalDate date;
}
