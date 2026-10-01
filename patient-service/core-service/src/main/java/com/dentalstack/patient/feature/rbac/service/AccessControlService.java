package com.dentalstack.patient.feature.rbac.service;

import com.dentalstack.patient.feature.rbac.dto.request.*;
import com.dentalstack.patient.feature.rbac.dto.response.AccessControlResponse;
import com.dentalstack.patient.feature.rbac.dto.response.AccessControlSubRoleResponse;
import com.dentalstack.patient.feature.rbac.dto.response.AccessControlUserResponseList;
import com.dentalstack.patient.feature.rbac.dto.response.SubRoleResponse;
import com.dentalstack.patient.feature.rbac.entity.Module;
import com.dentalstack.patient.feature.rbac.entity.Plan;
import com.dentalstack.patient.feature.rbac.entity.SubModule;
import com.dentalstack.patient.feature.rbac.entity.SubRole;
import jakarta.validation.Valid;

public interface AccessControlService {
    Plan createPlan(PlanRequest request);

    Plan getPlanById(Long id);

    SubRole createSubRole(CreateCustomOrDefaultRoles request);

    SubRoleResponse createCustomRole(CreateCustomOrDefaultRoles request);

    SubRoleResponse editCustomRole(EditCustomRoleRequest request);

    SubRoleResponse getSubRoleById(Long id);

    Module createModule(ModuleRequest request);

    Module getModuleById(Long id);

    SubModule createSubModule(SubModuleRequest request);

    SubModule getSubModuleById(Long id);

    AccessControlResponse getAccessControlResponse(AccessControlRequest request);

    AccessControlSubRoleResponse getAccessControlSubRoleResponse(AccessControlRequest request);

    void assignSubRoleToUser(AssignSubRoleRequest request);

    AccessControlUserResponseList getUsers(@Valid AccessControlUsersRequest request);

    SubRoleResponse assignSubModulePermissions(AssignSubModulePermissionRequest request);

    SubRoleResponse copyModuleSubModulePermissions(CopyModulePermissionsRequest request);
}
