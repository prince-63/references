package com.dentalstack.patient.feature.invitation.projection;

import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;

public interface PatientAppInviteStatus {
    Long getPatientId();

    String getAppInviteStatus();

    default AppInviteStatus getMappedAppInviteStatus() {
        return AppInviteStatus.valueOf(getAppInviteStatus());
    }
}
