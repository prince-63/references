package com.dentalstack.patient.feature.appointment.service.reminder;

import com.dentalstack.patient.feature.appointment.dto.AddAppointmentReminderRequest;
import com.dentalstack.patient.feature.appointment.dto.AppointmentReminderDetails;
import com.dentalstack.patient.feature.appointment.dto.UpdateAppointmentReminderRequest;
import java.util.List;

public interface AppointmentReminderService {
    void addReminder(AddAppointmentReminderRequest request);

    void updateReminder(UpdateAppointmentReminderRequest request);

    void deleteReminder(long reminderId);

    List<AppointmentReminderDetails> getReminders(Long patientId, Long doctorId);
}
