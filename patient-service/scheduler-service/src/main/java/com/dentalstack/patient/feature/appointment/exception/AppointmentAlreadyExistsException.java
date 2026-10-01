package com.dentalstack.patient.feature.appointment.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;
import java.time.ZonedDateTime;

public class AppointmentAlreadyExistsException extends BusinessException {
    public AppointmentAlreadyExistsException(long doctorId, long patientId, ZonedDateTime date) {
        super(
                BusinessErrorCode.APPOINTMENT_ALREADY_EXISTS,
                String.format(
                        "Appointment already exists for patient %s by doctor %s for date %s",
                        patientId, doctorId, date));
    }
}
