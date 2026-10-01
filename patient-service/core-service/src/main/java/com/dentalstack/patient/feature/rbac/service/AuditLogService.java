package com.dentalstack.patient.feature.rbac.service;

import com.dentalstack.patient.feature.rbac.dto.auditlog.AuditLogPageResponse;
import com.dentalstack.patient.feature.rbac.dto.auditlog.CreateAuditRequest;

public interface AuditLogService {
    void createAuditLog(CreateAuditRequest request);

    AuditLogPageResponse getAuditLogs(int page, int size, Long assignedByProfileId);
}
