package com.dentalstack.patient.feature.rbac.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssignSubRoleRequest {
    private Long userId;
    private Long subRoleId;
}
