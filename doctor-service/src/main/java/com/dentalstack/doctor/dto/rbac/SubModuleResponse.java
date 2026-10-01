package com.dentalstack.doctor.dto.rbac;

import com.dentalstack.doctor.entity.rbac.SubModule;
import com.dentalstack.doctor.enums.rbac.PermissionType;
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

    public static SubModuleResponse from(SubModule subModule) {
        return SubModuleResponse.builder()
                .id(subModule.getId())
                .name(subModule.getName())
                .description(subModule.getDescription())
                .build();
    }
}
