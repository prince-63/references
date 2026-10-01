package com.dentalstack.patient.feature.patient.exception;

public class PatientNotFoundException extends RuntimeException {
    public PatientNotFoundException(long id) {
        super(String.format("Patient not found with id %d", id));
    }

    public PatientNotFoundException() {
        super("Patient not found with id %d");
    }

    public PatientNotFoundException(String s) {
        super(s);
    }

    public static PatientNotFoundException withEmail(String email) {
        return new PatientNotFoundException(String.format("Patient not found with email %s", email));
    }

    public static PatientNotFoundException withMobileNo(String mobileNo) {
        return new PatientNotFoundException(String.format("Patient not found with mobile no %s", mobileNo));
    }

    public static PatientNotFoundException with(String email, String mobileNo, String uuid) {
        String message = "Patient not found with";
        if (email != null) {
            message += " email " + email;
        }
        if (mobileNo != null) {
            message += " mobile no " + mobileNo;
        }
        if (uuid != null) {
            message += " uuid " + uuid;
        }

        return new PatientNotFoundException(message);
    }
}
