package com.dentalstack.auth.exception.doctor;

public class FailedToFetchDoctorDetailsException extends RuntimeException {
    public FailedToFetchDoctorDetailsException(String emailId) {
        super(String.format("Failed to fetch details of doctor with email `%s`", emailId));
    }
}
