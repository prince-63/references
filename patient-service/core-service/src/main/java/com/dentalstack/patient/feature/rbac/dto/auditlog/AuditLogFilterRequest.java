package com.dentalstack.patient.feature.rbac.dto.auditlog;

import com.dentalstack.patient.feature.rbac.enums.AuditAction;
import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogFilterRequest {
    private AuditAction action;
    private String roleName;
    private String assignedByName;
    private String assignedToName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 10;

    @Builder.Default
    private String sortBy = "auditTimestamp";

    @Builder.Default
    private String sortDirection = "DESC";
}
