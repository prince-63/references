package com.dentalstack.patient.feature.rbac.dto.auditlog;

import com.dentalstack.patient.feature.rbac.enums.AuditAction;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAuditRequest {
    private Long subRoleId;
    private Long assignedByProfileId;
    private Long assignedToProfileId;
    private AuditAction action;
    private String changeDescription;
    private String previousValue;
    private String newValue;
    private String roleName;
    private String permissionName;
    private String moduleName;
}
