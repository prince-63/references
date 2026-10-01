package com.dentalstack.patient.feature.rbac.service.impl;

import com.dentalstack.patient.feature.rbac.dto.auditlog.AuditLogPageResponse;
import com.dentalstack.patient.feature.rbac.dto.auditlog.AuditLogResponse;
import com.dentalstack.patient.feature.rbac.dto.auditlog.CreateAuditRequest;
import com.dentalstack.patient.feature.rbac.entity.SubRole;
import com.dentalstack.patient.feature.rbac.entity.SubRoleAudit;
import com.dentalstack.patient.feature.rbac.repository.SubRoleRepository;
import com.dentalstack.patient.feature.rbac.repository.auditlog.SubRoleAuditRepository;
import com.dentalstack.patient.feature.rbac.service.AuditLogService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final SubRoleAuditRepository auditRepository;
    private final SubRoleRepository subRoleRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    public void createAuditLog(CreateAuditRequest request) {
        try {
            SubRole subRole = null;
            if (request.getSubRoleId() != null) {
                subRole = subRoleRepository.findById(request.getSubRoleId()).orElse(null);
            }

            UserProfile assignedBy = userProfileRepository
                    .findById(request.getAssignedByProfileId())
                    .orElseThrow(() -> new RuntimeException("Assigned by user not found"));

            UserProfile assignedTo = null;
            if (request.getAssignedToProfileId() != null) {
                assignedTo = userProfileRepository
                        .findById(request.getAssignedToProfileId())
                        .orElse(null);
            }

            SubRoleAudit audit = SubRoleAudit.builder()
                    .subRole(subRole)
                    .assignedBy(assignedBy)
                    .assignedTo(assignedTo)
                    .action(request.getAction())
                    .changeDescription(request.getChangeDescription())
                    .previousValue(request.getPreviousValue())
                    .newValue(request.getNewValue())
                    .roleName(request.getRoleName())
                    .permissionName(request.getPermissionName())
                    .auditTimestamp(LocalDateTime.now())
                    .build();

            auditRepository.save(audit);
            log.info(
                    "Audit log created for action: {} by user: {}",
                    request.getAction(),
                    assignedBy.getUser().getEmail());
        } catch (Exception e) {
            log.error("Error creating audit log: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create audit log", e);
        }
    }

    @Override
    public AuditLogPageResponse getAuditLogs(int page, int size, Long assignedByProfileId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "auditTimestamp"));

        Page<SubRoleAudit> summaryPage = auditRepository.findFilteredAuditLogs(assignedByProfileId, pageable);

        List<AuditLogResponse> auditLogResponses =
                summaryPage.getContent().stream().map(AuditLogResponse::from).toList();

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(summaryPage.getNumber())
                .pageSize(summaryPage.getSize())
                .totalPatients((int) summaryPage.getTotalElements())
                .totalPages(summaryPage.getTotalPages())
                .hasNext(summaryPage.hasNext())
                .hasPrevious(summaryPage.hasPrevious())
                .build();

        return AuditLogPageResponse.builder()
                .auditLogs(auditLogResponses)
                .pagination(paginationDetails)
                .build();
    }
}
