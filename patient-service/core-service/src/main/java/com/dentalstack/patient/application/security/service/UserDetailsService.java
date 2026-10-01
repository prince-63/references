package com.dentalstack.patient.application.security.service;

import com.dentalstack.patient.application.security.annotations.UserRole;
import com.dentalstack.patient.application.security.model.UserPrincipal;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsService {

    private final UserProfileRepository userProfileRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;

    public UserPrincipal loadUserByProfileId(Long profileId, String username, String userType) {
        log.debug("Loading user details for profileId: {}", profileId);

        try {
            UserProfile userProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUseWithInviterRoles(profileId)
                    .orElseThrow(() -> new DoctorNotFoundException(profileId));

            Set<UserRole> roles = extractUserRoles(profileId);
            Set<String> enabledConfigurations = loadEnabledConfigurations(profileId);

            boolean isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(profileId);

            Long effectiveProfileId = profileId;
            Long inviterProfileId = null;

            if (isAdminWithDefaultTag) {
                if (userProfile.getInviterProfile() != null) {
                    inviterProfileId = userProfile.getInviterProfile().getId();
                    effectiveProfileId = inviterProfileId;

                    enabledConfigurations = loadEnabledConfigurations(effectiveProfileId);
                }
            }

            return UserPrincipal.builder()
                    .userId(profileId)
                    .profileId(effectiveProfileId)
                    .originalProfileId(profileId)
                    .username(username)
                    .userType(userType)
                    .roles(roles)
                    .enabledConfigurations(enabledConfigurations)
                    .inviterProfileId(inviterProfileId)
                    .isAdminWithDefaultTag(isAdminWithDefaultTag)
                    .build();

        } catch (Exception e) {
            log.error("Error loading user details for profileId: {}", profileId, e);
            throw new RuntimeException("Failed to load user details", e);
        }
    }

    private Set<UserRole> extractUserRoles(Long profileId) {
        Set<UserRole> roles = new HashSet<>();

        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));
        if (userProfile != null) {
            if (userProfile.isEnterprise()) {
                roles.add(UserRole.ENTERPRISE);
            }
            if (userProfile.isPractice()) {
                roles.add(UserRole.PRACTICE);
            }
            if (userProfile.isInHouseManufacturingLab()) {
                roles.add(UserRole.IN_HOUSE_MANUFACTURING_LAB);
            }
            if (userProfile.isInternalUser()) {
                roles.add(UserRole.INTERNAL_USER);
            }
        }

        roles.add(UserRole.DOCTOR);

        return roles;
    }

    private Set<String> loadEnabledConfigurations(Long profileId) {
        List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(profileId);
        return new HashSet<>(enabledItems);
    }

    public boolean hasConfiguration(Long profileId, String configName) {
        Set<String> configurations = loadEnabledConfigurations(profileId);
        return configurations.contains(configName);
    }
}
