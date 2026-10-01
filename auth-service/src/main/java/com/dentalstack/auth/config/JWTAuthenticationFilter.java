package com.dentalstack.auth.config;

import com.dentalstack.auth.service.JWTService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JWTAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final JWTService jwtService;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    @Value("${dentalstack.jwt.secret.token}")
    private String secretKey;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        boolean isLocal = activeProfiles.contains("local");
        boolean isStage = activeProfiles.contains("stage");
        boolean isDev = activeProfiles.contains("dev");
        String path = request.getServletPath();
        return path.startsWith("/sms/v1/")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs/")
                || path.startsWith("/swagger-resources/")
                || path.startsWith("/mail/")
                || path.startsWith("/notification/v1/")
                || path.startsWith("/patient/custom/appointment/")
                || path.startsWith("/patient/")
                || path.startsWith("/patient/subscription/v1/")
                || path.startsWith("/patient/lead/v1/overview/")
                || path.startsWith("/patient/new/invitation/v1/doctor/")
                || path.startsWith("/patient/profile/v1/uuid/")
                || path.startsWith("/auth/v1/login/password")
                || path.startsWith("/auth/v1/signup/password/start")
                || path.startsWith("/auth/v1/signup/google/start")
                || path.startsWith("/auth/v1/logout-device")
                || path.startsWith("/auth/v1/email/otp/validate")
                || path.startsWith("/auth/v1/password/reset")
                || path.startsWith("/auth/v1/email/otp")
                || path.startsWith("/auth/v1/device/")
                || path.startsWith("/auth/doctor/v1/")
                || path.startsWith("/doctor/v1/")
                || path.startsWith("/auth/patient/v1/")
                || path.startsWith("/auth/token/v1/validate")
                || path.startsWith("/error")
                || path.startsWith("/auth")
                || path.startsWith("/actuator/health")
                || path.startsWith("/auth/token/v1/token/refresh")
                || path.startsWith("/auth/doctor/v2/update/details")
                || path.startsWith("/auth/doctor/v2")
                || path.startsWith("/auth/doctor/v2/signup/url")
                || path.startsWith("/auth/firebase/v1/token")
                || (isLocal && path.startsWith("/auth"))
                || (isStage && path.startsWith("/auth"))
                || (isDev && path.startsWith("/auth"))
                || path.startsWith("/auth/v1/admin/organization")
                || path.startsWith("/auth/v1/admin/get-password")
                || path.startsWith("/auth/v2/fetch-login-type")
                || path.startsWith("/auth/v1/admin/unblock")
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
        try {
            String jwt = extractJwtFromRequest(request);

            if (jwt != null) {
                processJwtToken(jwt, request);
            }
        } catch (SecurityException ex) {
            handleSecurityException(response, ex);
            return;
        } catch (Exception ex) {
            logger.error("Unexpected error during JWT processing", ex);
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

            validateTokenType(claims);

            String username = claims.getSubject();

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                authenticateUser(username, request);
            }
        } catch (ExpiredJwtException ex) {
            logger.warn("JWT token has expired: {}", ex.getMessage());
            throw new SecurityException("JWT token has expired", ex);
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature: {}", ex.getMessage());
            throw new SecurityException("Invalid JWT signature", ex);
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
            throw new SecurityException("Invalid JWT token", ex);
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {}", ex.getMessage());
            throw new SecurityException("Unsupported JWT token", ex);
        } catch (IllegalArgumentException ex) {
            logger.error("JWT validation error: {}", ex.getMessage());
            throw new SecurityException("JWT validation error: " + ex.getMessage(), ex);
        }
    }

    private void validateTokenType(Claims claims) {
        String tokenType = claims.get("token_type", String.class);

        if (tokenType == null) {
            throw new IllegalArgumentException("Token type is missing");
        }

        if (!"session_token".equals(tokenType)) {
            throw new IllegalArgumentException("Invalid token type. Expected 'session_token' but got: " + tokenType);
        }
    }

    private void authenticateUser(String username, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
        logger.debug("User authenticated successfully: {}", username);
    }

    private void handleSecurityException(HttpServletResponse response, SecurityException ex) throws IOException {
        logger.warn("Security exception during JWT processing", ex);

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
