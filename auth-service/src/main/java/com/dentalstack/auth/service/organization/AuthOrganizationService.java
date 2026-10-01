package com.dentalstack.auth.service.organization;

import com.dentalstack.auth.entity.organization.AuthOrganization;
import com.dentalstack.auth.repository.organization.AuthOrganizationRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthOrganizationService {

    private final AuthOrganizationRepository organizationRepository;

    @Transactional
    public AuthOrganization createOrganization(String name, int requestsPerMinute) {
        String token = AuthOrganization.generateSecureToken(32);

        UUID uuid = UUID.randomUUID();
        String uuidString = uuid.toString();
        String lastSection = uuidString.substring(uuidString.lastIndexOf('-') + 1);

        String modifiedName = lastSection + "_" + name;

        AuthOrganization organization = AuthOrganization.builder()
                .name(modifiedName)
                .token(token)
                .active(true)
                .requestsPerMinute(requestsPerMinute)
                .build();

        return organizationRepository.save(organization);
    }

    @Transactional
    public String regenerateToken(String name) {
        AuthOrganization organization = organizationRepository
                .findByName(name)
                .orElseThrow(() -> new RuntimeException("Organization not found: " + name));

        String toke = AuthOrganization.generateSecureToken(32);
        organization.setToken(toke);
        organizationRepository.save(organization);

        return toke;
    }

    public boolean validateOrganization(String name, String plainToken) {
        return organizationRepository.existsByNameAndToken(name, plainToken);
    }

    public Optional<AuthOrganization> getOrganizationByNameAndToken(String name, String token) {
        return organizationRepository.findByNameAndToken(name, token);
    }

    public List<AuthOrganization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    @Transactional
    public void deactivateOrganization(String name) {
        AuthOrganization organization = organizationRepository
                .findByName(name)
                .orElseThrow(() -> new RuntimeException("Organization not found: " + name));

        organization.setActive(false);
        organizationRepository.save(organization);
    }

    @Transactional
    public void updateRateLimit(String name, int requestsPerMinute) {
        AuthOrganization organization = organizationRepository
                .findByName(name)
                .orElseThrow(() -> new RuntimeException("Organization not found: " + name));

        organization.setRequestsPerMinute(requestsPerMinute);
        organizationRepository.save(organization);
    }

    public OrganizationCredentials getOrganizationCredentials(String name) {
        AuthOrganization organization = organizationRepository
                .findByName(name)
                .orElseThrow(() -> new RuntimeException("Organization not found: " + name));

        return new OrganizationCredentials(organization.getName(), organization.getToken());
    }

    // DTO for returning credentials
    public static class OrganizationCredentials {
        private final String name;
        private final String token;

        public OrganizationCredentials(String name, String token) {
            this.name = name;
            this.token = token;
        }

        public String getName() {
            return name;
        }

        public String getToken() {
            return token;
        }
    }
}
