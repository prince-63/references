package com.dentalstack.patient.feature.rbac.dto.response;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogResponse {
    private ZonedDateTime dateTime;
    private String user;
    private String role;
    private String status;
    private String module;
    private String action;
}
