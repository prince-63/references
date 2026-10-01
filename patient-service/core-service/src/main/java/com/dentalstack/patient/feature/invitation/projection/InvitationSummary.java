package com.dentalstack.patient.feature.invitation.projection;

import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;

public interface InvitationSummary {
    Long getPatientId();

    InvitationStatus getStatus();
}
