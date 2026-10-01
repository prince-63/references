package com.dentalstack.patient.feature.invitation.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class FailedToGenerateInvitationCodeException extends BusinessException {
    public FailedToGenerateInvitationCodeException() {
        super(BusinessErrorCode.FAILED_TO_GENERATE_INVITATION_CODE, "Failed to generate the invitation code");
    }
}
