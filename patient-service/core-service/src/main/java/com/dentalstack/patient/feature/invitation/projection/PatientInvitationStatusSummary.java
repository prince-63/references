package com.dentalstack.patient.feature.invitation.projection;

import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;

public interface PatientInvitationStatusSummary {
    Long getPatientId();

    InvitationStatus getStatus();

    Boolean getIsInvitationSent();
}
