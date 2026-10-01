package com.dentalstack.patient.feature.rbac.dto.response;

import com.dentalstack.patient.feature.rbac.enums.SubRoleTag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MinimalSubRoleResponse {
    private Long id;
    private String name;
    private SubRoleTag subRoleTag;
    private String description;
}
