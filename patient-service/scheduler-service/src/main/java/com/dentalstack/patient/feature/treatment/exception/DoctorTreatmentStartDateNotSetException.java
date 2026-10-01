package com.dentalstack.patient.feature.treatment.exception;

public class DoctorTreatmentStartDateNotSetException extends RuntimeException {
    public DoctorTreatmentStartDateNotSetException(Long id) {
        super(String.format("Treatment start date not set for aligner journey with id %d", id));
    }
}
