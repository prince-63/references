package com.dentalstack.patient.feature.doctor.exception;

public class MaximumLimitOfResentInvitationReachedException extends RuntimeException {
    public MaximumLimitOfResentInvitationReachedException(Long id) {
        super(String.format("Invitation with id %d is resent maximum times", id));
    }
}
