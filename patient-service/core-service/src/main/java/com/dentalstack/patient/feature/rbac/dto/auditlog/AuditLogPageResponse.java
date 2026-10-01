package com.dentalstack.patient.feature.rbac.dto.auditlog;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuditLogPageResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private List<AuditLogResponse> auditLogs;
    private PaginationDetails pagination;
}
