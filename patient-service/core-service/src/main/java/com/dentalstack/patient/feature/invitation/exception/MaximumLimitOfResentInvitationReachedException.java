package com.dentalstack.patient.feature.invitation.exception;

public class MaximumLimitOfResentInvitationReachedException extends RuntimeException {
    public MaximumLimitOfResentInvitationReachedException(Long id) {
        super(String.format("Invitation with id %d is resent maximum times", id));
    }
}
