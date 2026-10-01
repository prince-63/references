package com.dentalstack.patient.feature.rbac.dto.response;

import com.dentalstack.patient.feature.rbac.entity.SubRole;
import com.dentalstack.patient.feature.rbac.enums.SubRoleTag;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClonedFromSubRoleResponse {
    private Long id;
    private String name;
    private String description;
    private SubRoleTag subRoleTag;
    private List<ModuleResponse> modules;

    public static ClonedFromSubRoleResponse from(SubRole subRole) {
        return ClonedFromSubRoleResponse.builder()
                .id(subRole.getId())
                .name(subRole.getName())
                .description(subRole.getDescription())
                .subRoleTag(subRole.getSubRoleTag())
                .build();
    }
}
