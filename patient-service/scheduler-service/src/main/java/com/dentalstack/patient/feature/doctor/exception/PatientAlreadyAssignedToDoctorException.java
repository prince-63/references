package com.dentalstack.patient.feature.doctor.exception;

import static com.dentalstack.patient.global.enums.BusinessErrorCode.PATIENT_ALREADY_ASSIGNED_TO_DOCTOR;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.global.exception.BusinessException;

public class PatientAlreadyAssignedToDoctorException extends BusinessException {
    public PatientAlreadyAssignedToDoctorException(Long patientId, Long doctorId) {
        super(
                PATIENT_ALREADY_ASSIGNED_TO_DOCTOR,
                String.format("Patient %d already assigned to doctor %d", patientId, doctorId));
    }

    public PatientAlreadyAssignedToDoctorException(Patient patient) {
        super(
                PATIENT_ALREADY_ASSIGNED_TO_DOCTOR,
                String.format("Patient %d already assigned to doctor %d", patient.getId(), patient.getDoctorId()));
    }
}
