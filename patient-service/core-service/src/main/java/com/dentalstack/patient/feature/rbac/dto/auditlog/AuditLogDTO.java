package com.dentalstack.patient.feature.rbac.dto.auditlog;

import com.dentalstack.patient.feature.rbac.enums.AuditAction;
import java.time.LocalDateTime;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private Long id;
    private String roleName;
    private String assignedByName;
    private String assignedToName;
    private AuditAction action;
    private String changeDescription;
    private String previousValue;
    private String newValue;
    private String permissionName;
    private String moduleName;
    private LocalDateTime auditTimestamp;
}
