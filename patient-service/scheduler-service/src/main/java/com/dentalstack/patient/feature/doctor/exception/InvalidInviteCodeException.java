package com.dentalstack.patient.feature.doctor.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class InvalidInviteCodeException extends BusinessException {
    public InvalidInviteCodeException(String inviteCode) {
        super(BusinessErrorCode.INVALID_INVITE_CODE, String.format("Invalid Invitation code %s", inviteCode));
    }
}
