package com.dentalstack.patient.feature.appointment.entity;

import com.dentalstack.patient.feature.appointment.dto.AddAppointmentReminderRequest;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
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

    public static AppointmentReminder from(AddAppointmentReminderRequest request) {
        return AppointmentReminder.builder()
                .date(request.getLocalDate())
                .doctorId((request.getDoctorId()))
                .bracesJourneyId(request.getBracesJourneyId())
                .userType(request.getUserType())
                .reminderStatus(ReminderStatus.ACTIVE)
                .build();
    }

    public LocalDate getNextAppointmentDate(List<AppointmentReminder> reminders) {
        if (reminders == null || reminders.isEmpty()) {
            return null;
        }
        return reminders.stream()
                .map(AppointmentReminder::getDate)
                .filter(date -> date != null && !date.isBefore(LocalDate.now()))
                .min(LocalDate::compareTo)
                .orElse(null);
    }
}
