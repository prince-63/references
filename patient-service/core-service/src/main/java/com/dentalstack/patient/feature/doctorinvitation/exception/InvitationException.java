package com.dentalstack.patient.feature.doctorinvitation.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class InvitationException extends BusinessException {
    public InvitationException() {
        super(BusinessErrorCode.BAD_INVITATION_REQUEST, "You cannot send a request to yourself");
    }

    public InvitationException(String message, BusinessErrorCode businessErrorCode) {
        super(businessErrorCode, message);
    }

    public static InvitationException with(String email, String mobileNo) {
        BusinessErrorCode businessErrorCode = null;
        String message = "This";
        if (email != null) {
            businessErrorCode = BusinessErrorCode.INVITATION_EMAIL_USED_BY_PATIENT;
            message += " email " + email;
        }
        if (mobileNo != null) {
            message += " mobile no " + mobileNo;
            businessErrorCode = BusinessErrorCode.INVITATION_MOBILE_USED_BY_PATIENT;
        }
        message += " is already used by a patient";

        return new InvitationException(message, businessErrorCode);
    }
}
