package com.dentalstack.patient.feature.appointment.entity;

import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "braces_appointment_reminder",
        indexes = {
            @Index(name = "IX_braces_appointment_reminder_journey_id", columnList = "bracesJourneyId"),
            @Index(name = "IX_braces_appointment_reminder_doctor_id", columnList = "doctorId"),
            @Index(name = "IX_braces_appointment_reminder_status", columnList = "reminderStatus"),
            @Index(name = "IX_date_reminderStatus", columnList = "date, reminderStatus")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class AppointmentReminder extends BaseEntity {
    private long doctorId;

    private long bracesJourneyId;

    private UserType userType;

    @NotNull
    private LocalDate date;

    private ReminderStatus reminderStatus;
}
