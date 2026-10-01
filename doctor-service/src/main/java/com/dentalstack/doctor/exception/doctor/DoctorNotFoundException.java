package com.dentalstack.doctor.exception.doctor;

public class DoctorNotFoundException extends RuntimeException {

    public DoctorNotFoundException(Long doctorId) {
        super(String.format("Doctor not found with id %d", doctorId));
    }

    public DoctorNotFoundException(String string) {
        super(String.format("Doctor with email '%s' not found.", string));
    }
}
