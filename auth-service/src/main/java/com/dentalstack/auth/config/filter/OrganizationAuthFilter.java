package com.dentalstack.auth.config.filter;

import com.dentalstack.auth.entity.organization.AuthOrganization;
import com.dentalstack.auth.ratelimit.RateLimiter;
import com.dentalstack.auth.service.organization.AuthOrganizationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class OrganizationAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(OrganizationAuthFilter.class);
    private static final String ORG_NAME_HEADER = "X-Organization-Name";
    private static final String ORG_TOKEN_HEADER = "X-Organization-Token";
    private final AuthOrganizationService organizationService;
    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;
    // Paths that don't require organization auth
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        boolean isLocal = activeProfiles.contains("local");
        boolean isStage = activeProfiles.contains("stage");
        boolean isDev = activeProfiles.contains("dev");
        return path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-resources")
                || path.startsWith("/actuator/health")
                || path.startsWith("/error")
                || (isLocal && path.startsWith("/auth"))
                || (isStage && path.startsWith("/auth"))
                || (isDev && path.startsWith("/auth"))
                || path.startsWith("/auth/v1/admin/organization")
                || path.startsWith("/auth/v1/admin/get-password")
                || path.startsWith("/auth/v1/admin/unblock")
                || path.startsWith("/auth/v2/fetch-login-type")
                || path.startsWith("/auth/v1/validate/password")
                || path.startsWith("/auth/v2/validate/password");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (shouldNotFilter(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String orgName = request.getHeader(ORG_NAME_HEADER);
        String orgToken = request.getHeader(ORG_TOKEN_HEADER);

        // Check if organization headers are present
        if (orgName == null || orgToken == null) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Missing organization credentials");
            return;
        }

        // Validate organization credentials
        Optional<AuthOrganization> orgOptional = organizationService.getOrganizationByNameAndToken(orgName, orgToken);

        if (orgOptional.isEmpty()) {
            logger.warn("Invalid organization credentials: {}", orgName);
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid organization credentials");
            return;
        }

        AuthOrganization org = orgOptional.get();

        // Check if organization is active
        if (!org.isActive()) {
            logger.warn("Organization is deactivated: {}", orgName);
            sendErrorResponse(response, HttpStatus.FORBIDDEN, "Organization access is deactivated");
            return;
        }

        // Apply rate limiting
        Bucket bucket = rateLimiter.resolveBucket(org);
        if (!bucket.tryConsume(1)) {
            logger.warn("Rate limit exceeded for organization: {}", orgName);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("error", "Rate limit exceeded");
            errorDetails.put("message", "Too many requests, please try again later");
            response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Map<String, String> errorDetails = new HashMap<>();
        errorDetails.put("error", status.getReasonPhrase());
        errorDetails.put("message", message);
        response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
    }
}
