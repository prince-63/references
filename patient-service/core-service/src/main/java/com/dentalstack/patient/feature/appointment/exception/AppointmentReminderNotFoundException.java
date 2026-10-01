package com.dentalstack.patient.feature.appointment.exception;

import static com.dentalstack.patient.global.exception.BusinessErrorCode.APPOINTMENT_REMINDER_NOT_ADDED;
import static com.dentalstack.patient.global.exception.BusinessErrorCode.APPOINTMENT_REMINDER_NOT_FOUND;

import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.exception.BusinessException;

public class AppointmentReminderNotFoundException extends BusinessException {
    public AppointmentReminderNotFoundException(long reminderId) {
        super(
                APPOINTMENT_REMINDER_NOT_FOUND,
                String.format("Appointment reminder not found with this id %d", reminderId));
    }

    public AppointmentReminderNotFoundException(UserType userType) {
        super(APPOINTMENT_REMINDER_NOT_ADDED, String.format("Appointment reminder not added by %s", userType));
    }
}
