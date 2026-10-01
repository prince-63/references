package com.dentalstack.patient.feature.rbac.dto.update;

import java.util.List;
import lombok.Data;

@Data
public class UpdateSubRoleRequest {
    private Long subRoleId;
    private String name;
    private String description;
    private List<UpdateModuleRequest> modules;
}
