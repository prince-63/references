package com.dentalstack.doctor.exception.invitation;

public class DoctorInvitationAlreadyAcceptedException extends RuntimeException {
    public DoctorInvitationAlreadyAcceptedException(Long invitationId) {
        super(String.format("Doctor invitation with ID %d has already been accepted.", invitationId));
    }
}
