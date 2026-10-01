package com.dentalstack.doctor.service.rbac;

import com.dentalstack.doctor.dto.rbac.RoleCreationRequestDTO;
import com.dentalstack.doctor.dto.rbac.RoleDetails;
import com.dentalstack.doctor.entity.user.Feature;
import com.dentalstack.doctor.entity.user.Permission;
import com.dentalstack.doctor.entity.user.Role;
import com.dentalstack.doctor.entity.user.UserProfile;
import java.util.Set;

public interface RBACService {
    // Method to assign roles and permissions for a specific organization
    void assignOrganizationRoles(UserProfile userProfile, Set<Role> roles);

    Role createCustomRole(String roleName, String description);

    // Method to assign specific feature permissions to a role
    void assignFeaturePermissionsToRole(Role role, Feature feature, Set<Permission> permissions);

    RoleDetails createRoleWithFeaturesAndPermissions(RoleCreationRequestDTO request);
}
