package com.dentalstack.patient.feature.doctor.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class PatientInvitationNotFoundException extends BusinessException {
    public PatientInvitationNotFoundException(Long invitationId) {
        super(
                BusinessErrorCode.INVITATION_NOT_FOUND,
                String.format("Patient invitation not found with id %d", invitationId));
    }

    public PatientInvitationNotFoundException() {
        super(BusinessErrorCode.INVITATION_NOT_FOUND, "Patient invitation not found");
    }
}
