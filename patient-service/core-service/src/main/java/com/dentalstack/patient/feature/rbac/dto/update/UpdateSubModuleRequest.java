package com.dentalstack.patient.feature.rbac.dto.update;

import com.dentalstack.patient.feature.rbac.enums.PermissionType;
import java.util.Set;
import lombok.Data;

@Data
public class UpdateSubModuleRequest {
    private Long subModuleId;
    private String name;
    private String description;
    private Set<PermissionType> permissions;
}
