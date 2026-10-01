package com.dentalstack.patient.feature.appointment.projection;

public interface AppointmentCounts {
    Integer getTodayAppointments();

    Integer getTomorrowAppointments();

    Integer getDayAfterTomorrowAppointments();
}
