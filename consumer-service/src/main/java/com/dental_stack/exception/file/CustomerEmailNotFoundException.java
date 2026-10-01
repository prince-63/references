package com.dental_stack.exception.file;

/** Exception thrown when customer email is not found or invalid. */
public class CustomerEmailNotFoundException extends FileOperationException {

    private static final String ERROR_CODE = "CUSTOMER_EMAIL_NOT_FOUND";

    public CustomerEmailNotFoundException(String message) {
        super(ERROR_CODE, message);
    }

    public CustomerEmailNotFoundException(Long patientId, Long profileId) {
        super(
                ERROR_CODE,
                String.format(
                        "Customer email not found for patientId=%d, profileId=%d",
                        patientId, profileId));
    }

    public CustomerEmailNotFoundException(Long patientId, Long profileId, Throwable cause) {
        super(
                ERROR_CODE,
                String.format(
                        "Customer email not found for patientId=%d, profileId=%d",
                        patientId, profileId),
                cause);
    }
}
