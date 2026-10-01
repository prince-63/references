package com.dentalstack.patient.feature.invitation.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class InvalidInviteCodeException extends BusinessException {
    public InvalidInviteCodeException(String inviteCode) {
        super(BusinessErrorCode.INVALID_INVITE_CODE, String.format("Invalid Invitation code %s", inviteCode));
    }
}
