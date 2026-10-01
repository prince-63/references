package com.dentalstack.doctor.exception.invitation;

import com.dentalstack.doctor.exception.BusinessErrorCode;
import com.dentalstack.doctor.exception.BusinessException;

public class InvitationAlreadyExistsForEmailException extends BusinessException {
    public InvitationAlreadyExistsForEmailException(String email) {
        super(
                BusinessErrorCode.INVITATION_ALREADY_PRESENT_EMAIL,
                String.format("An active invitation already exists for email %s in this organization", email));
    }
}
