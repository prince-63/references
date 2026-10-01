package com.dentalstack.patient.feature.rbac.dto.request;

import com.dentalstack.patient.feature.rbac.enums.PermissionType;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssignSubModulePermissionRequest {

    private Long subRoleId;
    private Long subModuleId;
    private Set<PermissionType> permissions;
}
