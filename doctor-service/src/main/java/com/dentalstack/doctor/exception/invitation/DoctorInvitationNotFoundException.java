package com.dentalstack.doctor.exception.invitation;

public class DoctorInvitationNotFoundException extends RuntimeException {

    public DoctorInvitationNotFoundException(String email, Long organizationId) {
        super(String.format("Doctor invitation not found with email %s for org id %d", email, organizationId));
    }

    public DoctorInvitationNotFoundException(String inviteCode) {
        super(String.format("Doctor invitation not found with invite code %s", inviteCode));
    }

    public DoctorInvitationNotFoundException(long id) {
        super(String.format("Doctor invitation not found with id %d", id));
    }

    public DoctorInvitationNotFoundException() {
        super("Invitation id can't be null");
    }
}
