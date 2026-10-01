package com.dentalstack.doctor.controller.v1.rbac;

import com.dentalstack.doctor.dto.rbac.RoleCreationRequestDTO;
import com.dentalstack.doctor.dto.rbac.RoleDetails;
import com.dentalstack.doctor.service.rbac.RBACService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Rbac controller", description = "Roles related apis")
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/rbac/v1/")
@Slf4j
public class RbacController {

    private final RBACService rbacService;

    @PostMapping("/create")
    public RoleDetails createRoleWithFeatures(@Valid @RequestBody RoleCreationRequestDTO request) {
        return rbacService.createRoleWithFeaturesAndPermissions(request);
    }
}
