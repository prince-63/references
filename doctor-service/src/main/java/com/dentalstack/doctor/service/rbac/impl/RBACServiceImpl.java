package com.dentalstack.doctor.service.rbac.impl;

import com.dentalstack.doctor.dto.rbac.FeaturePermissionDTO;
import com.dentalstack.doctor.dto.rbac.RoleCreationRequestDTO;
import com.dentalstack.doctor.dto.rbac.RoleDetails;
import com.dentalstack.doctor.entity.user.*;
import com.dentalstack.doctor.repository.user.*;
import com.dentalstack.doctor.service.rbac.RBACService;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class RBACServiceImpl implements RBACService {

    private final UserProfileRepository userProfileRepository;

    private final FeatureRepository featureRepository;

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final AllowedFeaturesByRoleRepository allowedFeaturesByRoleRepository;

    public boolean hasAccess(Long userProfileId, String featureName, String permissionName) {
        UserProfile userProfile = userProfileRepository
                .findById(userProfileId)
                .orElseThrow(() -> new RuntimeException("User Profile not found"));

        Feature feature =
                featureRepository.findByName(featureName).orElseThrow(() -> new RuntimeException("Feature not found"));

        Permission permission = permissionRepository
                .findByName(permissionName)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        return userProfile.getRoles().stream().anyMatch(role -> hasFeaturePermission(role, feature, permission));
    }

    private boolean hasFeaturePermission(Role role, Feature feature, Permission permission) {
        return role.getAllowedFeatures().stream()
                .anyMatch(allowedFeature -> allowedFeature.getFeature().equals(feature)
                        && allowedFeature.getPermission().equals(permission));
    }

    // Method to assign roles and permissions for a specific organization
    @Override
    public void assignOrganizationRoles(UserProfile userProfile, Set<Role> roles) {
        userProfile.setRoles(roles);
        userProfileRepository.save(userProfile);
    }

    // Method to create custom roles for an organization
    @Override
    public Role createCustomRole(String roleName, String description) {
        Role customRole = Role.builder().name(roleName).description(description).build();

        return roleRepository.save(customRole);
    }

    // Method to assign specific feature permissions to a role
    @Override
    public void assignFeaturePermissionsToRole(Role role, Feature feature, Set<Permission> permissions) {
        permissions.forEach(permission -> {
            AllowedFeaturesByRole allowedFeature = AllowedFeaturesByRole.builder()
                    .role(role)
                    .feature(feature)
                    .permission(permission)
                    .build();

            allowedFeaturesByRoleRepository.save(allowedFeature);
        });
    }

    @Override
    @Transactional
    public RoleDetails createRoleWithFeaturesAndPermissions(RoleCreationRequestDTO request) {
        // Create or find the role
        Role role = Role.builder()
                .name(request.getRoleName())
                .description(request.getRoleDescription())
                .build();

        // Preprocess and save features
        List<Feature> savedFeatures = request.getFeaturePermissions().stream()
                .map(fp -> featureRepository
                        .findByName(fp.getFeatureName())
                        .orElseGet(() -> featureRepository.save(Feature.builder()
                                .name(fp.getFeatureName())
                                .description(fp.getFeatureDescription())
                                .build())))
                .toList();

        // Preprocess and save permissions
        List<Permission> savedPermissions = request.getFeaturePermissions().stream()
                .map(fp -> permissionRepository
                        .findByName(fp.getPermissionName())
                        .orElseGet(() -> permissionRepository.save(Permission.builder()
                                .name(fp.getPermissionName())
                                .description(fp.getPermissionDescription())
                                .build())))
                .toList();

        // Create allowed features
        Set<AllowedFeaturesByRole> allowedFeatures = new HashSet<>();
        for (FeaturePermissionDTO fp : request.getFeaturePermissions()) {
            Feature feature = savedFeatures.stream()
                    .filter(f -> f.getName().equals(fp.getFeatureName()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Feature not found: " + fp.getFeatureName()));

            Permission permission = savedPermissions.stream()
                    .filter(p -> p.getName().equals(fp.getPermissionName()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Permission not found: " + fp.getPermissionName()));

            AllowedFeaturesByRole allowedFeature = AllowedFeaturesByRole.builder()
                    .role(role)
                    .feature(feature)
                    .permission(permission)
                    .build();

            allowedFeatures.add(allowedFeature);
        }

        // Set allowed features and save the role
        role.setAllowedFeatures(allowedFeatures);
        Role savedRole = roleRepository.save(role);

        // Map the saved role to RoleDetailsDTO
        Set<RoleDetails.FeaturePermissionDTO> featurePermissions = savedRole.getAllowedFeatures().stream()
                .map(af -> RoleDetails.FeaturePermissionDTO.builder()
                        .featureName(af.getFeature().getName())
                        .permissionName(af.getPermission().getName())
                        .build())
                .collect(Collectors.toSet());

        return RoleDetails.builder()
                .name(savedRole.getName())
                .description(savedRole.getDescription())
                .allowedFeatures(featurePermissions)
                .build();
    }
}
