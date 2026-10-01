package com.dentalstack.patient.feature.appointment.exception;

import static com.dentalstack.patient.global.enums.BusinessErrorCode.APPOINTMENT_NOT_FOUND;

import com.dentalstack.patient.global.exception.BusinessException;

public class AppointmentNotFoundException extends BusinessException {
    public AppointmentNotFoundException(long appointmentId) {
        super(APPOINTMENT_NOT_FOUND, String.format("Appointment not found with this id %d", appointmentId));
    }

    public AppointmentNotFoundException() {
        super(APPOINTMENT_NOT_FOUND, "No upcoming appointment found for this patient");
    }
}
