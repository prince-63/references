package com.dentalstack.doctor.exception.invitation;

public class DoctorInvitationExpiredException extends RuntimeException {
    public DoctorInvitationExpiredException(String email) {
        super(String.format("Invitation for email %s has expired", email));
    }
}
