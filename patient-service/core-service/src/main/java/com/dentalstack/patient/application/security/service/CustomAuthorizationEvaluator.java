package com.dentalstack.patient.application.security.service;

import com.dentalstack.patient.application.security.annotations.ServiceConfig;
import com.dentalstack.patient.application.security.annotations.UserRole;
import com.dentalstack.patient.application.security.model.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component("authz")
public class CustomAuthorizationEvaluator {

    private UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authentication object: " + authentication);
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("No authenticated user found in security context");
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return (UserPrincipal) principal;
        }

        log.warn(
                "Principal is not of type UserPrincipal: {}",
                principal.getClass().getName());
        return null;
    }

    public boolean hasRole(String roleName) {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return false;
        }

        try {
            UserRole role = UserRole.valueOf(roleName.toUpperCase());
            boolean hasRole = user.hasRole(role);
            log.debug("Role check - User: {}, Role: {}, Result: {}", user.getProfileId(), roleName, hasRole);
            return hasRole;
        } catch (IllegalArgumentException e) {
            log.warn("Invalid role name: {}", roleName);
            return false;
        }
    }

    public boolean hasAnyRole(String... roleNames) {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return false;
        }

        for (String roleName : roleNames) {
            try {
                UserRole role = UserRole.valueOf(roleName.toUpperCase());
                if (user.hasRole(role)) {
                    log.debug("Role check passed - User: {}, Role: {}", user.getProfileId(), roleName);
                    return true;
                }
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role name: {}", roleName);
            }
        }

        log.debug(
                "Role check failed - User: {}, Required roles: {}", user.getProfileId(), String.join(", ", roleNames));
        return false;
    }

    public boolean hasAllRoles(String... roleNames) {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return false;
        }

        for (String roleName : roleNames) {
            try {
                UserRole role = UserRole.valueOf(roleName.toUpperCase());
                if (!user.hasRole(role)) {
                    log.debug("Role check failed - User: {}, Missing role: {}", user.getProfileId(), roleName);
                    return false;
                }
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role name: {}", roleName);
                return false;
            }
        }

        log.debug("All roles check passed - User: {}", user.getProfileId());
        return true;
    }

    public boolean hasConfiguration(String configName) {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return false;
        }

        try {
            ServiceConfig config = ServiceConfig.valueOf(configName.toUpperCase());
            boolean hasConfig = user.hasConfiguration(config);
            log.debug(
                    "Configuration check - User: {}, Config: {}, Result: {}",
                    user.getProfileId(),
                    configName,
                    hasConfig);
            return hasConfig;
        } catch (IllegalArgumentException e) {
            log.warn("Invalid configuration name: {}", configName);
            return false;
        }
    }

    public boolean hasAnyConfiguration(String... configNames) {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return false;
        }

        for (String configName : configNames) {
            try {
                ServiceConfig config = ServiceConfig.valueOf(configName.toUpperCase());
                if (user.hasConfiguration(config)) {
                    log.debug("Configuration check passed - User: {}, Config: {}", user.getProfileId(), configName);
                    return true;
                }
            } catch (IllegalArgumentException e) {
                log.warn("Invalid configuration name: {}", configName);
            }
        }

        log.debug(
                "Configuration check failed - User: {}, Required configs: {}",
                user.getProfileId(),
                String.join(", ", configNames));
        return false;
    }

    public boolean hasAllConfigurations(String... configNames) {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return false;
        }

        for (String configName : configNames) {
            try {
                ServiceConfig config = ServiceConfig.valueOf(configName.toUpperCase());
                if (!user.hasConfiguration(config)) {
                    log.debug(
                            "Configuration check failed - User: {}, Missing config: {}",
                            user.getProfileId(),
                            configName);
                    return false;
                }
            } catch (IllegalArgumentException e) {
                log.warn("Invalid configuration name: {}", configName);
                return false;
            }
        }

        log.debug("All configurations check passed - User: {}", user.getProfileId());
        return true;
    }

    public boolean isEnterpriseWithConfig(String configName) {
        return hasRole("ENTERPRISE") && hasConfiguration(configName);
    }

    public boolean hasManufacturingAccess() {
        return hasRole("ENTERPRISE") && hasConfiguration("MANUFACTURING");
    }

    public boolean hasPlanningAccess() {
        return hasRole("ENTERPRISE") && hasConfiguration("PLANNING");
    }

    public boolean isPracticeOrInHouseLab() {
        return hasAnyRole("PRACTICE", "IN_HOUSE_MANUFACTURING_LAB");
    }

    public boolean canAccessPatientData() {
        UserPrincipal user = getCurrentUser();
        return user != null;
    }

    public boolean isOwnProfile(Long requestedProfileId) {
        UserPrincipal user = getCurrentUser();
        if (user == null || requestedProfileId == null) {
            return false;
        }

        boolean isOwn = user.getProfileId().equals(requestedProfileId);
        log.debug(
                "Profile ownership check - User: {}, Requested: {}, Result: {}",
                user.getProfileId(),
                requestedProfileId,
                isOwn);
        return isOwn;
    }

    public boolean isInternalOrAdmin() {
        return hasAnyRole("INTERNAL_USER", "ADMIN");
    }
}
