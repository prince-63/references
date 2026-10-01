package com.dental_stack.exception.file;

/** Exception thrown when patient information is not found or invalid during file operations. */
public class PatientNotFoundException extends FileOperationException {

    private static final String ERROR_CODE = "PATIENT_NOT_FOUND";

    public PatientNotFoundException(String message) {
        super(ERROR_CODE, message);
    }

    public PatientNotFoundException(Long profileId) {
        super(ERROR_CODE, String.format("Unable to resolve patientId for profileId=%d", profileId));
    }

    public PatientNotFoundException(Long profileId, Throwable cause) {
        super(
                ERROR_CODE,
                String.format("Unable to resolve patientId for profileId=%d", profileId),
                cause);
    }
}
