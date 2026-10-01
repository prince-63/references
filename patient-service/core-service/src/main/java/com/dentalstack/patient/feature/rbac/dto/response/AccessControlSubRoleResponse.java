package com.dentalstack.patient.feature.rbac.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccessControlSubRoleResponse {
    private Long id;
    private String name;
    private String description;
    private Long planId;
    private List<MinimalSubRoleResponse> subRoles;
}
