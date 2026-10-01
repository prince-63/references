package com.dentalstack.patient.feature.appointment.dto.reminder;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateCustomAppointmentReminderRequest {

    private long reminderId;
    private long doctorId;

    @NotNull
    private ZonedDateTime startDate;

    @NotNull
    private ZonedDateTime endDate;

    @Nullable
    private Long practiceLocationId;

    private String notes;
    private String amount;
}
