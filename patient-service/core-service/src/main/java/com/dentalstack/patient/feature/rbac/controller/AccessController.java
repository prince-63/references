package com.dentalstack.patient.feature.rbac.controller;

import com.dentalstack.patient.feature.rbac.dto.request.*;
import com.dentalstack.patient.feature.rbac.dto.response.AccessControlResponse;
import com.dentalstack.patient.feature.rbac.dto.response.AccessControlSubRoleResponse;
import com.dentalstack.patient.feature.rbac.dto.response.AccessControlUserResponseList;
import com.dentalstack.patient.feature.rbac.dto.response.SubRoleResponse;
import com.dentalstack.patient.feature.rbac.entity.Module;
import com.dentalstack.patient.feature.rbac.entity.Plan;
import com.dentalstack.patient.feature.rbac.entity.SubModule;
import com.dentalstack.patient.feature.rbac.entity.SubRole;
import com.dentalstack.patient.feature.rbac.service.AccessControlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/access/control/v1")
@RequiredArgsConstructor
@CrossOrigin
public class AccessController {

    private final AccessControlService accessControlService;

    @PostMapping("/plans")
    public ResponseEntity<Plan> createPlan(@RequestBody PlanRequest request) {
        return ResponseEntity.ok(accessControlService.createPlan(request));
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<Plan> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(accessControlService.getPlanById(id));
    }

    @PostMapping("/sub-roles")
    public ResponseEntity<SubRole> createSubRole(@RequestBody CreateCustomOrDefaultRoles request) {
        return ResponseEntity.ok(accessControlService.createSubRole(request));
    }

    @GetMapping("/sub-roles/{id}")
    public ResponseEntity<SubRoleResponse> getSubRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(accessControlService.getSubRoleById(id));
    }

    @PostMapping("/modules")
    public ResponseEntity<Module> createModule(@RequestBody ModuleRequest request) {
        return ResponseEntity.ok(accessControlService.createModule(request));
    }

    @GetMapping("/modules/{id}")
    public ResponseEntity<Module> getModuleById(@PathVariable Long id) {
        return ResponseEntity.ok(accessControlService.getModuleById(id));
    }

    @PostMapping("/sub-modules")
    public ResponseEntity<SubModule> createSubModule(@RequestBody SubModuleRequest request) {
        return ResponseEntity.ok(accessControlService.createSubModule(request));
    }

    @GetMapping("/sub-modules/{id}")
    public ResponseEntity<SubModule> getSubModuleById(@PathVariable Long id) {
        return ResponseEntity.ok(accessControlService.getSubModuleById(id));
    }

    @PostMapping("/assign-sub-role")
    public ResponseEntity<String> assignSubRoleToUser(@RequestBody AssignSubRoleRequest request) {
        accessControlService.assignSubRoleToUser(request);
        return ResponseEntity.ok("SubRole assigned successfully");
    }

    @PostMapping("/roles-and-permissions")
    public ResponseEntity<AccessControlResponse> getAccessControlResponse(
            @RequestBody @Valid AccessControlRequest request) {
        return ResponseEntity.ok(accessControlService.getAccessControlResponse(request));
    }

    @PostMapping("/roles-and-permissions-minimal")
    public ResponseEntity<AccessControlSubRoleResponse> getAccessControlResponseMinimal(
            @RequestBody @Valid AccessControlRequest request) {
        return ResponseEntity.ok(accessControlService.getAccessControlSubRoleResponse(request));
    }

    @PostMapping("/custom-roles")
    public ResponseEntity<SubRoleResponse> createCustomRoles(@Valid @RequestBody CreateCustomOrDefaultRoles request) {
        return ResponseEntity.ok(accessControlService.createCustomRole(request));
    }

    @PutMapping("/edit/custom-roles")
    public ResponseEntity<SubRoleResponse> editCustomRole(@RequestBody EditCustomRoleRequest request) {
        return ResponseEntity.ok(accessControlService.editCustomRole(request));
    }

    @PostMapping("/users")
    public ResponseEntity<AccessControlUserResponseList> getUsers(
            @Valid @RequestBody AccessControlUsersRequest request) {
        return ResponseEntity.ok(accessControlService.getUsers(request));
    }

    @PostMapping("/assign-sub-module-permission")
    public ResponseEntity<SubRoleResponse> assignSubModulePermissions(
            @Valid @RequestBody AssignSubModulePermissionRequest request) {
        return ResponseEntity.ok(accessControlService.assignSubModulePermissions(request));
    }

    @PostMapping("/subroles/copy-module-permissions")
    public ResponseEntity<SubRoleResponse> copyModulePermissions(
            @Valid @RequestBody CopyModulePermissionsRequest request) {
        return ResponseEntity.ok(accessControlService.copyModuleSubModulePermissions(request));
    }
}
