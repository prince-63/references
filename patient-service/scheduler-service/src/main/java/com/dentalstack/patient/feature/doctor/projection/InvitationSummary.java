package com.dentalstack.patient.feature.doctor.projection;

import com.dentalstack.patient.feature.doctor.enums.InvitationStatus;

public interface InvitationSummary {
    Long getPatientId();

    InvitationStatus getStatus();
}
