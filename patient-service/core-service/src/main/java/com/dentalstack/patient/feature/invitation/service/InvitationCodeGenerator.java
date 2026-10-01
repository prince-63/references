package com.dentalstack.patient.feature.invitation.service;

import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.entity.InvitationCode;

public interface InvitationCodeGenerator {
    InvitationCode generateInvitationCode(Invitation invitation);
}
