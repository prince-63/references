package com.dentalstack.patient.feature.appointment.dto.reminder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeleteAppointmentReminderRequest {

    private long bracesJourneyId;
    private long reminderId;
}
