package com.dentalstack.doctor.dto.rbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeaturePermissionDTO {
    private String featureName;
    private String featureDescription;
    private String permissionName;
    private String permissionDescription;
}
