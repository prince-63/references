package com.dentalstack.patient.feature.rbac.dto.update;

import java.util.List;
import lombok.Data;

@Data
public class UpdateModuleRequest {
    private Long moduleId;
    private String name;
    private String description;
    private List<UpdateSubModuleRequest> subModules;
}
