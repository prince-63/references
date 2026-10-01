package com.dentalstack.doctor.dto.rbac;

import com.dentalstack.doctor.entity.rbac.Module;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ModuleResponse {
    private Long id;
    private String name;
    private String description;
    private List<SubModuleResponse> subModules;

    public static ModuleResponse from(Module module) {
        return ModuleResponse.builder()
                .id(module.getId())
                .name(module.getName())
                .description(module.getDescription())
                .subModules(
                        module.getSubModules() != null
                                ? module.getSubModules().stream()
                                        .map(SubModuleResponse::from)
                                        .toList()
                                : List.of())
                .build();
    }
}
