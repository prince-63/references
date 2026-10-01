package com.dentalstack.doctor.exception.doctor;

public class DoctorNotActiveException extends RuntimeException {
    public DoctorNotActiveException(Long doctorId) {
        super(String.format("Doctor not active with id %d", doctorId));
    }
}
