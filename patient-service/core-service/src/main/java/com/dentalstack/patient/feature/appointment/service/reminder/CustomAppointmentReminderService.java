package com.dentalstack.patient.feature.appointment.service.reminder;

import com.dentalstack.patient.feature.appointment.dto.reminder.*;
import com.dentalstack.patient.feature.appointment.enums.AppointmentReminderFilter;
import java.util.List;

public interface CustomAppointmentReminderService {
    CustomAppointmentReminderDetails setReminder(SetAppointmentReminderRequest request);

    void deleteReminder(DeleteAppointmentReminderRequest request);

    CustomAppointmentReminderDetails updateReminder(UpdateCustomAppointmentReminderRequest request);

    List<CustomAppointmentReminderResponse> getReminders(
            Long patientId, Long doctorId, AppointmentReminderFilter filter);

    List<CustomAppointmentReminderResponse> getRemindersForPatients(
            Long patientId, Long doctorId, AppointmentReminderFilter filter);

    CustomAppointmentReminderResponse getLatestPastAppointment(Long patientId, Long doctorId);

    CustomAppointmentReminderResponse getNextUpcomingAppointment(Long patientId, Long doctorId);
}
