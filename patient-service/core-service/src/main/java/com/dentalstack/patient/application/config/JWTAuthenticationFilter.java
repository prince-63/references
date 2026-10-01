package com.dentalstack.patient.application.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JWTAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    @Value("${dentalstack.jwt.secret.token}")
    private String secretKey;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        boolean isLocal = activeProfiles.contains("local");
        boolean isDev = activeProfiles.contains("dev");

        return path.startsWith("/patient/profile/v1/register")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs/")
                || path.startsWith("/doctor/")
                || path.startsWith("/doctor/v1/sign/up")
                || path.startsWith("/patient/profile/v1/email")
                || path.startsWith("/patient/cache")
                || path.startsWith("/auth/doctor/v1/")
                || path.startsWith("/actuator/health")
                || path.startsWith("/actuator")
                || path.startsWith("/doctor/rbac/v1/")
                || path.startsWith("/doctor/v1/email")
                || path.startsWith("/mail/invite-practice")
                || path.startsWith("/patient/timeline/v1/without")
                || path.startsWith("/patient/subscription/v1/details")
                || path.startsWith("/patient/cache/v1/")
                || path.startsWith("/patient/location")
                || path.startsWith("/patient/v2/patient-connection-details")
                || (isLocal && path.startsWith("/patient"))
                || (isDev && path.startsWith("/patient"))
                || path.startsWith("/ws-chat")
                || path.startsWith("/patient/ws-chat")
                || path.startsWith("/patient/card-display-config")
                || path.startsWith("/patient/drive")
                || path.startsWith("/patient/subscription/v1/deactivate-subscription")
                || path.startsWith("/patient/profile/v2/get/profile_picture")
                || path.startsWith("/patient/doctor/v1/super-admin/details")
                || path.startsWith("/patient/services/info")
                || path.startsWith("/doctor/invitation/v1");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (shouldNotFilter(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = extractJwtFromRequest(request);
            if (jwt != null) {
                processJwtToken(jwt, request);
            }
        } catch (SecurityException ex) {
            handleSecurityException(response, ex);
            return;
        } catch (Exception ex) {
            sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }
        return authHeader.substring(BEARER_PREFIX.length());
    }

    private void processJwtToken(String jwt, HttpServletRequest request) throws SecurityException {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey())
                    .build()
                    .parseSignedClaims(jwt)
                    .getPayload();

            String username = claims.getSubject();
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                authenticateUser(username, request);
            }
        } catch (ExpiredJwtException ex) {
            throw new SecurityException("JWT token has expired");
        } catch (SignatureException ex) {
            throw new SecurityException("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            throw new SecurityException("Invalid JWT token");
        } catch (UnsupportedJwtException ex) {
            throw new SecurityException("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            throw new SecurityException("JWT validation error");
        }
    }

    private void authenticateUser(String username, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    private void handleSecurityException(HttpServletResponse response, SecurityException ex) throws IOException {
        if (ex.getCause() instanceof ExpiredJwtException) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT token has expired");
        } else {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid JWT token");
        }
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.getWriter().write(String.format("{\"error\": \"%s\"}", message));
        response.getWriter().flush();
    }
}
