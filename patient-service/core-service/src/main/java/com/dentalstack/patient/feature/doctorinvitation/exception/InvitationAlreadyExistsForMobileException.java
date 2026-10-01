package com.dentalstack.patient.feature.doctorinvitation.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class InvitationAlreadyExistsForMobileException extends BusinessException {

    public InvitationAlreadyExistsForMobileException(String mobile) {
        super(
                BusinessErrorCode.INVITATION_ALREADY_PRESENT_MOBILE,
                String.format("An active invitation already exists for mobile %s in this organization", mobile));
    }
}
