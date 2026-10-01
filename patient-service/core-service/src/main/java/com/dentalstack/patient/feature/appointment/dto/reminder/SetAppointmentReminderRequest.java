package com.dentalstack.patient.feature.appointment.dto.reminder;

import jakarta.annotation.Nullable;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SetAppointmentReminderRequest {
    private long patientId;
    private long doctorId;
    private ZonedDateTime startDate;

    private ZonedDateTime endDate;

    @Nullable
    private String notes;

    private String name;
    private String amount;

    private Long practiceLocationId;
    private Long organizationId;
    private Long profileId;
}
