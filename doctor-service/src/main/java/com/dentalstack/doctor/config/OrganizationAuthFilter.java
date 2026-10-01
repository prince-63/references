package com.dentalstack.doctor.config;

import com.dentalstack.doctor.client.AuthServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
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

    private final AuthServiceClient authServiceClient;
    private final ObjectMapper objectMapper;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

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
                || path.startsWith("/doctor/v1/doctor-details")
                || path.startsWith("/doctor/practice/location/v1")
                || (isLocal && path.startsWith("/doctor"))
                || (isStage && path.startsWith("/doctor"))
                || (isDev && path.startsWith("/doctor"))
                || path.startsWith("/doctor/v1/organization")
                || path.startsWith("/doctor/profile/management/v1/profiles")
                || path.startsWith("/doctor/v1/doc-details")
                || path.startsWith("/doctor/invitation/v1/");
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

        try {
            // Validate organization credentials with auth service
            boolean isValid = authServiceClient.validateOrganizationCredentials(orgName, orgToken);

            if (!isValid) {
                logger.warn("Invalid organization credentials: {}", orgName);
                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid organization credentials");
                return;
            }

            // If validation passes, continue with the request
            filterChain.doFilter(request, response);

        } catch (FeignException.Unauthorized e) {
            logger.warn("Unauthorized organization credentials: {}", orgName);
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid organization credentials");
        } catch (FeignException.Forbidden e) {
            logger.warn("Organization access forbidden: {}", orgName);
            sendErrorResponse(response, HttpStatus.FORBIDDEN, "Organization access is deactivated");
        } catch (FeignException.TooManyRequests e) {
            logger.warn("Rate limit exceeded for organization: {}", orgName);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("error", "Rate limit exceeded");
            errorDetails.put("message", "Too many requests, please try again later");
            response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
        } catch (Exception e) {
            logger.error("Error validating organization credentials for: {}", orgName, e);
            sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
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
