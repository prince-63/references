package com.dentalstack.patient.feature.appointment.dto;

import com.dentalstack.patient.feature.user.enums.UserType;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddAppointmentReminderRequest {

    private long doctorId;
    private long bracesJourneyId;
    private UserType userType;
    private LocalDate localDate;
}
