package com.dentalstack.patient.feature.patient.exception;

public class FailedToUploadPatientProfilePictureException extends RuntimeException {
    public FailedToUploadPatientProfilePictureException(Long patientId) {
        super(String.format("Failed to upload profile picture of patient %d.", patientId));
    }
}
