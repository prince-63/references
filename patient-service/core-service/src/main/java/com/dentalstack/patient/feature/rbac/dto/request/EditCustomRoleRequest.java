package com.dentalstack.patient.feature.rbac.dto.request;

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
public class EditCustomRoleRequest {
    private Long subRoleId;
    private String name;
    private String description;
    private Long profileId;

    @Nullable
    private Long cloneFromSubRoleId;

    private List<CreateSubModuleRequest> subModules;
}
