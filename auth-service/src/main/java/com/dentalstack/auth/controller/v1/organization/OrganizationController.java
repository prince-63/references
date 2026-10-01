package com.dentalstack.auth.controller.v1.organization;

import com.dentalstack.auth.dto.organization.CreateOrganizationRequest;
import com.dentalstack.auth.dto.organization.OrganizationDTO;
import com.dentalstack.auth.dto.organization.UpdateRateLimitRequest;
import com.dentalstack.auth.entity.organization.AuthOrganization;
import com.dentalstack.auth.ratelimit.RateLimiter;
import com.dentalstack.auth.service.organization.AuthOrganizationService;
import io.github.bucket4j.Bucket;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/v1/admin/organization")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Organization Management", description = "APIs for managing organization access tokens")
public class OrganizationController {

    private final AuthOrganizationService organizationService;
    private final RateLimiter rateLimiter;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new organization with API access")
    public ResponseEntity<OrganizationDTO> createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        AuthOrganization organization =
                organizationService.createOrganization(request.getName(), request.getRequestsPerMinute());
        return ResponseEntity.ok(convertToDTO(organization));
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateOrganizationCredentials(
            @RequestHeader("X-Organization-Name") String orgName,
            @RequestHeader("X-Organization-Token") String orgToken) {

        // Validate organization credentials
        Optional<AuthOrganization> orgOptional = organizationService.getOrganizationByNameAndToken(orgName, orgToken);

        if (orgOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }

        AuthOrganization org = orgOptional.get();

        // Check if organization is active
        if (!org.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(false);
        }

        // Apply rate limiting
        Bucket bucket = rateLimiter.resolveBucket(org);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(false);
        }

        return ResponseEntity.ok(true);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all organizations")
    public ResponseEntity<List<OrganizationDTO>> getAllOrganizations() {
        List<AuthOrganization> organizations = organizationService.getAllOrganizations();
        List<OrganizationDTO> dtos =
                organizations.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{name}/token/regenerate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Regenerate API token for an organization")
    public ResponseEntity<OrganizationDTO> regenerateToken(@PathVariable String name) {
        try {
            String token = organizationService.regenerateToken(name);

            AuthOrganizationService.OrganizationCredentials credentials =
                    organizationService.getOrganizationCredentials(name);

            OrganizationDTO dto = OrganizationDTO.builder()
                    .name(credentials.getName())
                    .token(token)
                    .build();

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            throw new RuntimeException("Failed to regenerate token for organization: " + name, e);
        }
    }

    @PutMapping("/{name}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate an organization")
    public ResponseEntity<Void> deactivateOrganization(@PathVariable String name) {
        organizationService.deactivateOrganization(name);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{name}/rate-limit")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update rate limit for an organization")
    public ResponseEntity<OrganizationDTO> updateRateLimit(
            @PathVariable String name, @Valid @RequestBody UpdateRateLimitRequest request) {

        organizationService.updateRateLimit(name, request.getRequestsPerMinute());

        // Get organization for rate limit update
        AuthOrganization org = organizationService.getAllOrganizations().stream()
                .filter(o -> o.getName().equals(name))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Organization not found: " + name));

        // Update the rate limit bucket
        rateLimiter.updateBucketRateLimit(org);

        return ResponseEntity.ok(convertToDTO(org));
    }

    @GetMapping("/{name}/credentials")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get credentials for an organization")
    public ResponseEntity<Map<String, Object>> getOrganizationCredentials(@PathVariable String name) {
        try {
            AuthOrganizationService.OrganizationCredentials credentials =
                    organizationService.getOrganizationCredentials(name);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put(
                    "credentials",
                    Map.of(
                            "name", credentials.getName(),
                            "token", credentials.getToken()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to get credentials: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    private OrganizationDTO convertToDTO(AuthOrganization organization) {
        return OrganizationDTO.builder()
                .id(organization.getId())
                .name(organization.getName())
                .token(organization.getToken())
                .active(organization.isActive())
                .requestsPerMinute(organization.getRequestsPerMinute())
                .createdAt(organization.getCreatedAt())
                .updatedAt(organization.getUpdatedAt())
                .build();
    }
}
