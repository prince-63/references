package com.dentalstack.patient.feature.rbac.dto.auditlog;

import com.dentalstack.patient.feature.rbac.entity.SubRoleAudit;
import com.dentalstack.patient.feature.rbac.enums.AuditAction;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;

    @JsonFormat(pattern = "d-MMM-yyyy, h:mm:ss a")
    private LocalDateTime dateTime;

    private String user;
    private AuditAction action;
    private String formattedAction;
    private String changeDescription;
    private String previousValue;
    private String newValue;
    private String roleName;
    private String permissionName;
    private String moduleName;
    private Long subRoleId;
    private Long assignedByProfileId;
    private Long assignedToProfileId;
    private String assignedToUser;

    public static AuditLogResponse from(SubRoleAudit audit) {
        return AuditLogResponse.builder()
                .id(audit.getId())
                .dateTime(audit.getAuditTimestamp())
                .user(getUserName(audit.getAssignedBy()))
                .action(audit.getAction())
                .formattedAction(getFormattedAction(audit))
                .changeDescription(audit.getChangeDescription())
                .previousValue(audit.getPreviousValue())
                .newValue(audit.getNewValue())
                .roleName(audit.getRoleName())
                .permissionName(audit.getPermissionName())
                .subRoleId(getSubRoleId(audit))
                .assignedByProfileId(getAssignedByProfileId(audit))
                .assignedToProfileId(getAssignedToProfileId(audit))
                .assignedToUser(getAssignedToUserName(audit))
                .build();
    }

    private static String getUserName(UserProfile profile) {
        if (profile != null && profile.getUser() != null) {
            return profile.getUser().getFirstName() + " " + profile.getUser().getLastName();
        }
        return "";
    }

    private static String getFormattedAction(SubRoleAudit audit) {
        if (audit.getAction() == null) return "";

        switch (audit.getAction()) {
            case ROLE_CREATED:
                return "Role Created - " + audit.getRoleName();
            case ROLE_UPDATED:
                return "Role Updated - " + audit.getRoleName();
            case ROLE_DELETED:
                return "Role Deleted - " + audit.getRoleName();
            case ROLE_ASSIGNED:
                return "Role Assigned - " + getAssignedToUserName(audit);
            case ROLE_UNASSIGNED:
                return "Role Unassigned - " + getAssignedToUserName(audit);
            case CREATED_CUSTOM_ROLE:
                return "Custom Role Created - " + audit.getRoleName();
            default:
                return audit.getAction() + " - " + audit.getRoleName();
        }
    }

    private static Long getSubRoleId(SubRoleAudit audit) {
        return audit.getSubRole() != null ? audit.getSubRole().getId() : null;
    }

    private static Long getAssignedByProfileId(SubRoleAudit audit) {
        return audit.getAssignedBy() != null ? audit.getAssignedBy().getId() : null;
    }

    private static Long getAssignedToProfileId(SubRoleAudit audit) {
        return audit.getAssignedTo() != null ? audit.getAssignedTo().getId() : null;
    }

    private static String getAssignedToUserName(SubRoleAudit audit) {
        if (audit.getAssignedTo() != null && audit.getAssignedTo().getUser() != null) {
            return audit.getAssignedTo().getUser().getFirstName() + " "
                    + audit.getAssignedTo().getUser().getLastName();
        }
        return "";
    }
}
