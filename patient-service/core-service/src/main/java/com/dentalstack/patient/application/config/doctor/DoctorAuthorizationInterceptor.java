package com.dentalstack.patient.application.config.doctor;

import com.dentalstack.patient.feature.doctor.service.DoctorAuthorizationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.SecretKey;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class DoctorAuthorizationInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(DoctorAuthorizationInterceptor.class);

    private final DoctorAuthorizationService doctorAuthService;
    private final ObjectMapper objectMapper;

    @Value("${dentalstack.jwt.secret.token}")
    private String decodedSecretKey;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(decodedSecretKey));
    }

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler)
            throws Exception {

        if (shouldSkipValidation(request)) {
            return true;
        }

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendErrorResponse(response, HttpStatus.FORBIDDEN, "Access denied");
                return false;
            }

            String token = authHeader.substring(7);
            Claims claims = extractClaims(token);

            if (claims == null) {
                sendErrorResponse(response, HttpStatus.FORBIDDEN, "Access denied");
                return false;
            }

            Long tokenUserId = claims.get("user_id", Long.class);
            String userType = claims.get("user_type", String.class);

            if (!"DOCTOR".equals(userType) && !"PATIENT".equals(userType)) {
                throw new IllegalArgumentException("Invalid user type.");
            }

            if (!"DOCTOR".equals(userType)) {
                return true;
            }

            if (tokenUserId == null) {
                throw new IllegalArgumentException("Invalid user id.");
            }

            if (HttpMethod.GET.matches(request.getMethod())) {
                return validateGetRequest(request, response, tokenUserId);
            } else {
                return validateRequestWithBody(request, response, tokenUserId);
            }

        } catch (Exception e) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Authorization validation failed");
            return false;
        }
    }

    private Claims extractClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isMultipartRequest(HttpServletRequest request) {
        String contentType = request.getContentType();
        return contentType != null
                && (contentType.toLowerCase().startsWith("multipart/form-data")
                        || contentType.toLowerCase().startsWith("multipart/mixed"));
    }

    private boolean shouldSkipValidation(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();
        boolean isLocal = activeProfiles.contains("local");
        boolean isDev = activeProfiles.contains("dev");

        if ("POST".equals(method) && !isMultipartRequest(request)) {
            try {
                byte[] body = getCachedRequestBody(request);
                if (body != null && body.length > 0) {
                    String bodyString = new String(
                            body, request.getCharacterEncoding() != null ? request.getCharacterEncoding() : "UTF-8");
                    logger.info("POST Request Body for path {}: {}", path, bodyString);
                } else {
                    logger.info("POST Request for path {}: Empty body or body not available", path);
                }
            } catch (Exception e) {
                logger.warn("Failed to read POST request body for path {}: {}", path, e.getMessage());
            }
        }

        if (("POST".equals(method) || "PUT".equals(method)) && isMultipartRequest(request)) {
            return true;
        }

        return path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/actuator/health")
                || path.startsWith("/actuator")
                || path.startsWith("/error")
                || path.startsWith("/patient/cache")
                || path.startsWith("/patient/profile/v1/email")
                || path.startsWith("/patient/profile/v1/")
                || path.startsWith("/patient/unassigned/v1/auth/register")
                || path.startsWith("/patient/files/v1/get-files-by-names")
                || path.startsWith("/patient/files/v1/get-files")
                || path.startsWith("/doctor/billing/v1")
                || path.startsWith("/doctor/account/v1/update")
                || path.startsWith("/mail/invite-practice")
                || path.startsWith("/patient/timeline/v1/without")
                || path.startsWith("/patient/subscription/v1/details")
                || path.startsWith("/doctor/invitation/v1")
                || path.startsWith("/patient/timeline/v1/event")
                || path.startsWith("/patient/location")
                || path.startsWith("/patient/v2/patient-connection-details")
                || (isLocal && path.startsWith("/patient"))
                || (isDev && path.startsWith("/patient"))
                || path.startsWith("/patient/card-display-config")
                || path.startsWith("/patient/doctor/v1/super-admin/details")
                || path.startsWith("/ws-chat")
                || path.startsWith("/patient/drive")
                || path.startsWith("/patient/profile/v2/get/profile_picture")
                || path.startsWith("/patient/subscription/v1/deactivate-subscription")
                || path.startsWith("/patient/ws-chat")
                || path.startsWith("/patient/chargebee/v1/create/customer/subscription");
    }

    private boolean validateGetRequest(HttpServletRequest request, HttpServletResponse response, Long tokenUserId)
            throws IOException {

        String headerUserId = request.getHeader("User-Id");
        if (headerUserId != null) {
            try {
                Long requestUserId = Long.parseLong(headerUserId);
                if (!tokenUserId.equals(requestUserId)) {
                    sendErrorResponse(response, HttpStatus.FORBIDDEN, "Access denied");
                    return false;
                }
            } catch (NumberFormatException e) {
                sendErrorResponse(response, HttpStatus.BAD_REQUEST, "Invalid userId format in header");
                return false;
            }
        }

        String profileIdParam = request.getHeader("Profile-id");
        if (profileIdParam != null) {
            try {
                Long profileId = Long.parseLong(profileIdParam);
                if (doctorAuthService.isProfileOwnedByDoctor(tokenUserId, profileId)) {
                    sendErrorResponse(response, HttpStatus.FORBIDDEN, "Access denied");
                    return false;
                }
            } catch (NumberFormatException e) {
                sendErrorResponse(response, HttpStatus.BAD_REQUEST, "Invalid profileId format");
                return false;
            }
        }

        return true;
    }

    private boolean validateRequestWithBody(HttpServletRequest request, HttpServletResponse response, Long tokenUserId)
            throws IOException {

        byte[] body = getCachedRequestBody(request);
        if (body == null || body.length == 0) {
            return true;
        }

        try {
            String bodyString =
                    new String(body, request.getCharacterEncoding() != null ? request.getCharacterEncoding() : "UTF-8");

            JsonNode jsonNode = objectMapper.readTree(bodyString);

            JsonNode doctorIdNode = jsonNode.get("doctor_id");
            if (doctorIdNode != null) {
                Long requestDoctorId = doctorIdNode.asLong();
                if (!tokenUserId.equals(requestDoctorId)) {
                    sendErrorResponse(response, HttpStatus.FORBIDDEN, "Access denied");
                    return false;
                }

                JsonNode profileIdNode = jsonNode.get("profile_id");
                if (profileIdNode != null) {
                    Long profileId = profileIdNode.asLong();
                    if (doctorAuthService.isProfileOwnedByDoctor(tokenUserId, profileId)) {
                        sendErrorResponse(response, HttpStatus.FORBIDDEN, "Access denied");
                        return false;
                    }
                }
            } else {
                sendErrorResponse(response, HttpStatus.BAD_REQUEST, "Invalid request format");
                return false;
            }

        } catch (Exception e) {
            sendErrorResponse(response, HttpStatus.BAD_REQUEST, "Invalid request format");
            return false;
        }

        return true;
    }

    private byte[] getCachedRequestBody(HttpServletRequest request) {
        if (request instanceof CachedBodyHttpServletRequest) {
            return ((CachedBodyHttpServletRequest) request).getCachedBody();
        }

        HttpServletRequest currentRequest = request;
        while (currentRequest instanceof jakarta.servlet.http.HttpServletRequestWrapper wrapper) {
            currentRequest = (HttpServletRequest) wrapper.getRequest();
            if (currentRequest instanceof CachedBodyHttpServletRequest) {
                return ((CachedBodyHttpServletRequest) currentRequest).getCachedBody();
            }
        }

        currentRequest = request;
        int depth = 0;
        while (currentRequest instanceof jakarta.servlet.http.HttpServletRequestWrapper && depth < 10) {
            currentRequest =
                    (HttpServletRequest) ((jakarta.servlet.http.HttpServletRequestWrapper) currentRequest).getRequest();
            depth++;
        }

        return null;
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
