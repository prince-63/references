package com.dentalstack.doctor.dto.rbac;

import com.dentalstack.doctor.entity.rbac.Module;
import com.dentalstack.doctor.entity.rbac.SubRole;
import com.dentalstack.doctor.entity.rbac.SubRoleModulePermission;
import com.dentalstack.doctor.entity.rbac.SubRoleSubModulePermission;
import com.dentalstack.doctor.enums.rbac.SubRoleTag;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.LazyInitializationException;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubRoleResponse {
    private Long id;
    private Long planId;
    private String name;
    private String description;
    private SubRoleTag subRoleTag;
    private List<ModuleResponse> modules;
    private ClonedFromSubRoleResponse clonedFromSubRole;

    public static SubRoleResponse from(SubRole subRole) {
        Long planId = null;
        try {
            if (subRole.getPlan() != null) {
                planId = subRole.getPlan().getId();
            }
        } catch (LazyInitializationException e) {
            return null;
        }
        return SubRoleResponse.builder()
                .planId(planId)
                .id(subRole.getId())
                .name(subRole.getName())
                .description(subRole.getDescription())
                .subRoleTag(subRole.getSubRoleTag())
                .modules(buildModuleResponsesForSubRole(subRole))
                .build();
    }

    private static List<ModuleResponse> buildModuleResponsesForSubRole(SubRole subRole) {
        // Combine both module permissions and submodule permissions
        Set<Module> modules = new HashSet<>();

        if (subRole.getModulePermissions() != null) {
            subRole.getModulePermissions().stream()
                    .map(SubRoleModulePermission::getModule)
                    .forEach(modules::add);
        }

        if (subRole.getSubModulePermissions() != null) {
            subRole.getSubModulePermissions().stream()
                    .map(perm -> perm.getSubModule().getModule())
                    .forEach(modules::add);
        }

        return modules.stream()
                .map(module -> {
                    // Get all submodule permissions for this module
                    List<SubRoleSubModulePermission> subModulePermissions = subRole.getSubModulePermissions() != null
                            ? subRole.getSubModulePermissions().stream()
                                    .filter(perm ->
                                            perm.getSubModule().getModule().equals(module))
                                    .toList()
                            : List.of();

                    return ModuleResponse.builder()
                            .id(module.getId())
                            .name(module.getName())
                            .description(module.getDescription())
                            .subModules(subModulePermissions.stream()
                                    .map(perm -> SubModuleResponse.builder()
                                            .id(perm.getSubModule().getId())
                                            .name(perm.getSubModule().getName())
                                            .description(perm.getSubModule().getDescription())
                                            .permissions(new ArrayList<>(perm.getPermissions()))
                                            .build())
                                    .collect(Collectors.toList()))
                            .build();
                })
                .collect(Collectors.toList());
    }
}
