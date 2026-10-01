package com.dentalstack.patient.feature.rbac.projection;

import com.dentalstack.patient.feature.rbac.enums.AuditAction;
import java.time.LocalDateTime;

public interface AuditLogSummary {
    Long getId();

    LocalDateTime getDateTime();

    String getUser();

    AuditAction getAction();

    String getFormattedAction();

    String getChangeDescription();

    String getPreviousValue();

    String getNewValue();

    String getRoleName();

    String getPermissionName();

    String getModuleName();

    Long getSubRoleId();

    Long getAssignedByProfileId();

    Long getAssignedToProfileId();

    String getAssignedToUser();
}
