package com.dentalstack.patient.feature.patient.exception;

public class DoctorNotAssignedToPatientException extends RuntimeException {
    public DoctorNotAssignedToPatientException(long patientId) {
        super(String.format("Doctor not assigned to the patient %d", patientId));
    }
}
