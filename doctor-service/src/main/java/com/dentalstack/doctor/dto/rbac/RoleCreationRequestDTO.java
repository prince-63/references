package com.dentalstack.doctor.dto.rbac;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleCreationRequestDTO {

    private String roleName;
    private String roleDescription;
    private List<FeaturePermissionDTO> featurePermissions;
}
