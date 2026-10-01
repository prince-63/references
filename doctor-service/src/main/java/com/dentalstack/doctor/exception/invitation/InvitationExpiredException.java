package com.dentalstack.doctor.exception.invitation;

import com.dentalstack.doctor.exception.BusinessErrorCode;
import com.dentalstack.doctor.exception.BusinessException;

public class InvitationExpiredException extends BusinessException {
    public InvitationExpiredException() {
        super(BusinessErrorCode.INVITATION_EXPIRED, "This invitation has been expired");
    }
}
