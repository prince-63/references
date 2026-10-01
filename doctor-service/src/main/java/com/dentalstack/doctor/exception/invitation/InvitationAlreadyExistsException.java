package com.dentalstack.doctor.exception.invitation;

import com.dentalstack.doctor.exception.BusinessErrorCode;
import com.dentalstack.doctor.exception.BusinessException;

public class InvitationAlreadyExistsException extends BusinessException {
    public InvitationAlreadyExistsException() {
        super(
                BusinessErrorCode.INVITATION_ALREADY_PRESENT,
                "An active invitation already exists for this email or mobile in this organization");
    }
}
