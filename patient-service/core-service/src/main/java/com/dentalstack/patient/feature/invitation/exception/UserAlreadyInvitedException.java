package com.dentalstack.patient.feature.invitation.exception;

import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class UserAlreadyInvitedException extends BusinessException {
    public UserAlreadyInvitedException(long inviterId, UserType inviterUserType, UserType invitedUserType) {
        super(
                BusinessErrorCode.ALREADY_INVITED,
                String.format(
                        "%s with given details already invited by %s with id %s",
                        invitedUserType, inviterUserType, inviterId));
    }

    public UserAlreadyInvitedException(String mobile) {
        super(
                BusinessErrorCode.PATIENT_ALREADY_ASSIGNED_TO_DOCTOR,
                String.format("Patient with this %s already exists", mobile));
    }
}
