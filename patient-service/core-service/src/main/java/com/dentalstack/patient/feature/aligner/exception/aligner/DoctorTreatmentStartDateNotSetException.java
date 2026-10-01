package com.dentalstack.patient.feature.aligner.exception.aligner;

public class DoctorTreatmentStartDateNotSetException extends RuntimeException {
    public DoctorTreatmentStartDateNotSetException(Long id) {
        super(String.format("Treatment start date not set for aligner journey with id %d", id));
    }
}
