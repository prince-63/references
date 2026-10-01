package com.dentalstack.patient.feature.braces.dto.app;

import com.dentalstack.patient.feature.appointment.dto.reminder.AppointmentReminderDetails;
import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.payment.dto.payments.TreatmentPaymentsDetails;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BracesAppDashboardDetails {

    private LocalDate treatmentStartDate;
    private LocalDate treatmentEndDate;
    private ZonedDateTime upcomingAppointmentDate;
    private TreatmentPaymentsDetails treatmentPaymentsDetails;

    @Builder.Default
    private List<AppointmentReminderDetails> appointmentReminders = new ArrayList<>();

    public static BracesAppDashboardDetails from(
            BracesJourney bracesJourney, TreatmentPaymentsDetails treatmentPaymentsDetails) {
        List<AppointmentReminderDetails> reminders;
        ZonedDateTime upcomingAppointmentDate = null;

        if (bracesJourney.getReminders() != null
                && !bracesJourney.getReminders().isEmpty()) {
            reminders = bracesJourney.getReminders().stream()
                    .filter(reminder -> reminder.getStatus().equals(ReminderStatus.ACTIVE))
                    .sorted(Comparator.comparing(Reminder::getCreatedAt))
                    .map(AppointmentReminderDetails::from)
                    .toList();

        } else reminders = null;

        upcomingAppointmentDate = bracesJourney.getAppointments().stream()
                .filter(appointment -> appointment.getStatus().equals(AppointmentStatus.ACTIVE)
                        && appointment.getStartDate() != null
                        && appointment.getStartDate().isAfter(ZonedDateTime.now()))
                .map(Appointment::getStartDate)
                .min(ZonedDateTime::compareTo)
                .orElse(null);
        return BracesAppDashboardDetails.builder()
                .treatmentEndDate(bracesJourney.getDoctorTreatmentEndDate())
                .treatmentStartDate(bracesJourney.getDoctorTreatmentStartDate())
                .treatmentPaymentsDetails(treatmentPaymentsDetails)
                .appointmentReminders(reminders)
                .upcomingAppointmentDate(upcomingAppointmentDate)
                .build();
    }
}
