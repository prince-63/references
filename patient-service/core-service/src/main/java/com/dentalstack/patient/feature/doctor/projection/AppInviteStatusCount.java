package com.dentalstack.patient.feature.doctor.projection;

public interface AppInviteStatusCount {
    Long getConnectedCount();

    Long getPendingCount();

    Long getNotConnectedCount();
}
