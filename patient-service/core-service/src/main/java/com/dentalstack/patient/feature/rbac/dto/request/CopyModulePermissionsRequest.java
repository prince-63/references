package com.dentalstack.patient.feature.rbac.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CopyModulePermissionsRequest {
    private Long sourceSubRoleId;
    private Long targetSubRoleId;
    private Long moduleId;
}
