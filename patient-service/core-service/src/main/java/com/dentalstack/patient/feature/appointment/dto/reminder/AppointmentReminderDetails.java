package com.dentalstack.patient.feature.appointment.dto.reminder;

import com.dentalstack.patient.feature.reminder.entity.CustomAppointmentReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentReminderDetails {
    private long reminderId;
    private LocalDate date;
    private ZoneId zone;
    private LocalTime time;
    private String name;
    private Long patientId;

    public static AppointmentReminderDetails from(Reminder reminder) {
        var metadata = (CustomAppointmentReminderMetadata) reminder.getMetadata();
        return new AppointmentReminderDetails(
                reminder.getId(),
                reminder.getDate(),
                reminder.getZone(),
                reminder.getTime(),
                metadata.getName(),
                metadata.getPatientId());
    }
}
