package com.dentalstack.doctor.dto.rbac;

import java.util.Set;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoleDetails {
    private String name;
    private String description;
    private Set<FeaturePermissionDTO> allowedFeatures;

    @Data
    @Builder
    public static class FeaturePermissionDTO {
        private String featureName;
        private String permissionName;
    }
}
