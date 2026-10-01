package com.dentalstack.patient.application.security.model;

import com.dentalstack.patient.application.security.annotations.ServiceConfig;
import com.dentalstack.patient.application.security.annotations.UserRole;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Data
@Builder
public class UserPrincipal implements UserDetails {

    private Long userId;
    private Long profileId;
    private Long originalProfileId;
    private String username;
    private String userType;
    private Set<UserRole> roles;
    private Set<String> enabledConfigurations;
    private String profileType;
    private Long inviterProfileId;
    private boolean isAdminWithDefaultTag;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public boolean hasRole(UserRole role) {
        return roles != null && roles.contains(role);
    }

    public boolean hasAnyRole(UserRole... roles) {
        if (this.roles == null || roles == null) {
            return false;
        }
        for (UserRole role : roles) {
            if (this.roles.contains(role)) {
                return true;
            }
        }
        return false;
    }

    public boolean hasAllRoles(UserRole... roles) {
        if (this.roles == null || roles == null) {
            return false;
        }
        for (UserRole role : roles) {
            if (!this.roles.contains(role)) {
                return false;
            }
        }
        return true;
    }

    public boolean hasConfiguration(ServiceConfig config) {
        if (enabledConfigurations == null || config == null) {
            return false;
        }
        return enabledConfigurations.stream().anyMatch(c -> config.matches(c));
    }

    public boolean hasAnyConfiguration(ServiceConfig... configs) {
        if (enabledConfigurations == null || configs == null) {
            return false;
        }
        for (ServiceConfig config : configs) {
            if (hasConfiguration(config)) {
                return true;
            }
        }
        return false;
    }

    public boolean hasAllConfigurations(ServiceConfig... configs) {
        if (enabledConfigurations == null || configs == null) {
            return false;
        }
        for (ServiceConfig config : configs) {
            if (!hasConfiguration(config)) {
                return false;
            }
        }
        return true;
    }

    public boolean isEnterprise() {
        return hasRole(UserRole.ENTERPRISE);
    }

    public boolean isPractice() {
        return hasRole(UserRole.PRACTICE);
    }

    public boolean isInHouseManufacturingLab() {
        return hasRole(UserRole.IN_HOUSE_MANUFACTURING_LAB);
    }

    public boolean isInternalUser() {
        return hasRole(UserRole.INTERNAL_USER);
    }

    public Long getEffectiveProfileId() {
        return profileId;
    }
}
