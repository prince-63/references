package com.dentalstack.patient.feature.doctorinvitation.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class DoctorInvitationNotFoundException extends BusinessException {

    public DoctorInvitationNotFoundException(Long id) {
        super(
                BusinessErrorCode.DOCTOR_INVITATION_NOT_FOUND,
                String.format("Doctor invitation not found with id %d", id));
    }
}
