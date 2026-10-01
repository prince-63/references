package com.dentalstack.patient.feature.rbac.dto.response;

import com.dentalstack.patient.feature.rbac.enums.PermissionType;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubModuleResponse {
    private Long id;
    private String name;
    private String description;
    private List<PermissionType> permissions;
}
