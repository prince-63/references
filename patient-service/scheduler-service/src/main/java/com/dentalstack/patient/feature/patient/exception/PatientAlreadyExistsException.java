package com.dentalstack.patient.feature.patient.exception;

public class PatientAlreadyExistsException extends RuntimeException {
    public PatientAlreadyExistsException(String email) {
        super(String.format("Patient with email id %s already exists", email));
    }

    public PatientAlreadyExistsException(String mobile, String type) {
        super(String.format("Patient with %s %s already exists", type, mobile));
    }
}
