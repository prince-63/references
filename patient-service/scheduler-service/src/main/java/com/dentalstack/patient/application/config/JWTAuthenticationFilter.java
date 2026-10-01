package com.dentalstack.patient.application.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import lombok.NonNull;
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

    @Value("${dentalstack.jwt.secret.token}")
    private String secretKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/v3/api-docs/")
                || path.equals("/v3/api-docs")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/swagger-resources/")
                || path.equals("/swagger-ui.html")
                || path.startsWith("/mail/")
                || path.startsWith("/notification/v1/")
                || path.startsWith("/patient/custom/appointment/")
                || path.startsWith("/patient/subscription/v1/")
                || path.startsWith("/patient/lead/v1/overview/")
                || path.startsWith("/patient/new/invitation/v1/doctor/")
                || path.startsWith("/patient/profile/v1/uuid/")
                || path.startsWith("/patient/chargebee/v1/create/customer/subscription")
                || path.startsWith("/patient/profile/v1")
                || path.startsWith("/actuator/health")
                || path.startsWith("/patient/location/v1")
                || path.startsWith("/patient/unassigned/")
                || path.startsWith("/patient/app/v1/")
                || path.startsWith("/patient/v2/patient-connection-details")
                || path.startsWith("/patient/chargebee/v1/event")
                || path.startsWith("/patient/timeline/v1");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // If this is a public endpoint, skip JWT processing
            if (shouldNotFilter(request)) {
                filterChain.doFilter(request, response);
                return;
            }

            String jwt = extractJwtFromRequest(request);

            if (jwt != null) {
                processJwtToken(jwt, request);
            } else {
                // No JWT token provided
                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "No JWT token found");
                return;
            }
            filterChain.doFilter(request, response);

        } catch (SecurityException ex) {
            handleSecurityException(response, ex);
        } catch (Exception ex) {
            logger.error("Unexpected error during request processing", ex);
            sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    private void handleSecurityException(HttpServletResponse response, SecurityException ex) throws IOException {
        logger.warn("Security exception during JWT processing", ex);

        if (ex.getCause() instanceof ExpiredJwtException) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT token has expired");
        } else if (ex.getCause() instanceof SignatureException) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid JWT signature");
        } else if (ex.getCause() instanceof MalformedJwtException) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Malformed JWT token");
        } else if (ex.getCause() instanceof UnsupportedJwtException) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Unsupported JWT token");
        } else {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Authentication failed");
        }
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter()
                .write(String.format(
                        "{\"status\": %d, \"error\": \"%s\", \"message\": \"%s\"}",
                        status.value(), status.getReasonPhrase(), message));
        response.getWriter().flush();
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
            Claims claims =
                    Jwts.parser().setSigningKey(secretKey).parseClaimsJws(jwt).getBody();

            String username = claims.getSubject();

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                authenticateUser(username, request);
            }
        } catch (ExpiredJwtException ex) {
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
            logger.error("JWT claims string is empty: {}", ex.getMessage());
            throw new SecurityException("JWT claims string is empty", ex);
        }
    }

    private void authenticateUser(String username, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
        logger.debug("User authenticated successfully: {}", username);
    }
}
