package com.dentalstack.patient.feature.rbac.controller.auditlog;

import com.dentalstack.patient.feature.rbac.dto.auditlog.AuditLogPageResponse;
import com.dentalstack.patient.feature.rbac.dto.auditlog.CreateAuditRequest;
import com.dentalstack.patient.feature.rbac.service.AuditLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/audit")
@RequiredArgsConstructor
@Slf4j
public class AuditLogController {

    private final AuditLogService auditLogService;

    @PostMapping("/create")
    public void createAuditLog(@Valid @RequestBody CreateAuditRequest request) {
        auditLogService.createAuditLog(request);
    }

    @GetMapping
    public ResponseEntity<AuditLogPageResponse> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam Long assignedByProfileId) {

        AuditLogPageResponse auditLogs = auditLogService.getAuditLogs(page, size, assignedByProfileId);

        return ResponseEntity.ok(auditLogs);
    }
}
