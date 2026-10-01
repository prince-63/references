package com.dentalstack.patient.feature.doctor.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class DoctorNotFoundException extends BusinessException {

    public DoctorNotFoundException(Long patientId) {
        super(
                BusinessErrorCode.DOCTOR_NOT_FOUND,
                String.format("Doctor not found for a patient with id %s", patientId));
    }

    public DoctorNotFoundException() {
        super(BusinessErrorCode.DOCTOR_NOT_FOUND, "Doctor not found");
    }

    public DoctorNotFoundException(String email) {
        super(BusinessErrorCode.DOCTOR_NOT_FOUND, String.format("Doctor not found for a patient with email %s", email));
    }
}
