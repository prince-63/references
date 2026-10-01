package com.dentalstack.patient.feature.workflow.core.task_tracker.projection;

import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import java.time.LocalDateTime;

public interface CancelledPatientTaskTrackerProjection {
    Long getId();

    Long getPatientId();

    String getPatientUuid();

    String getPatientName();

    String getClinicName();

    String getCreatedBy();

    LocalDateTime getCreatedOn();

    Short getInvitationStatus();

    default InvitationStatus getMappedInvitationStatus() {
        Short statusIndex = getInvitationStatus();
        if (statusIndex == null || statusIndex < 0 || statusIndex >= InvitationStatus.values().length) {
            return null;
        }
        return InvitationStatus.values()[statusIndex];
    }
}
