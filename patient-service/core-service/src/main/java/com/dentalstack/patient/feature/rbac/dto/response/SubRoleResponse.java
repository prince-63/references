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
public class SubRoleResponse {
    private Long id;
    private String name;
    private Long planId;
    private String description;
    private SubRoleTag subRoleTag;
    private List<ModuleResponse> modules;
    private ClonedFromSubRoleResponse clonedFromSubRole;

    public static SubRoleResponse from(SubRole subRole) {
        return SubRoleResponse.builder()
                .id(subRole.getId())
                .name(subRole.getName())
                .description(subRole.getDescription())
                .subRoleTag(subRole.getSubRoleTag())
                .clonedFromSubRole(
                        subRole.getClonedFrom() != null
                                ? ClonedFromSubRoleResponse.from(subRole.getClonedFrom())
                                : null)
                .build();
    }
}
