package com.dentalstack.patient.feature.appointment.exception;

import static com.dentalstack.patient.global.enums.BusinessErrorCode.APPOINTMENT_REMINDER_ALREADY_EXIST;

import com.dentalstack.patient.global.exception.BusinessException;
import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentReminderAlreadyExistException extends BusinessException {
    public AppointmentReminderAlreadyExistException() {
        super(APPOINTMENT_REMINDER_ALREADY_EXIST, "Appointment reminder already exits. For the braces journey");
    }

    public AppointmentReminderAlreadyExistException(LocalTime startTime, LocalDate startDate) {
        super(
                APPOINTMENT_REMINDER_ALREADY_EXIST,
                String.format(
                        "Appointment reminder already exists for this %s date and time %s.",
                        startDate.toString(), startTime.toString()));
    }
}
