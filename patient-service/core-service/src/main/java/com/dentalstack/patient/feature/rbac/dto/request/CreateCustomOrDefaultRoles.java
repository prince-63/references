package com.dentalstack.patient.feature.rbac.dto.request;

import com.dentalstack.patient.feature.rbac.enums.SubRoleTag;
import java.util.List;
import javax.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateCustomOrDefaultRoles {
    private String name;
    private String description;
    private SubRoleTag subRoleTag;
    private Long planId;
    private Long profileId;

    @Nullable
    private Long cloneFromSubRoleId;

    private List<CreateSubModuleRequest> subModules;
}
