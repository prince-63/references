package com.dentalstack.patient.feature.rbac.dto.response;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogListResponse {
    private List<AuditLogResponse> logs;
    private PaginationDetails paginationDetails;
}
