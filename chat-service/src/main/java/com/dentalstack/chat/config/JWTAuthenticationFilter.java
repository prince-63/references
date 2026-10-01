package com.dentalstack.chat.config;

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

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        boolean isLocal = activeProfiles.contains("local");
        boolean isStage = activeProfiles.contains("stage");
        return path.startsWith("/public/")
                || path.startsWith("/sms/v1/")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs/")
                || path.startsWith("/swagger-resources/")
                || path.startsWith("/mail/")
                || path.startsWith("/chat")
                || path.startsWith("/actuator/health")
                || path.startsWith("/notification/v1/")
                || path.startsWith("/mail/invite-practice")
                || path.startsWith("/chat/v1/unread/message/count")
                || path.startsWith("/chat/v2/")
                || path.startsWith("/subscription/email/v1")
                || path.startsWith("/treatment/email/v1")
                || (isStage && path.startsWith("/patient"))
                || path.startsWith("/order/management/email/v1")
                || path.startsWith("/ws-chat")
                || (isLocal)
                || path.startsWith("/consent/email/v1/send-to-accepter")
                || path.startsWith("/consent/email/v1/send-copy-to-admin")
                || path.startsWith("/doctor/invitation/email/v1");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // If this is a public endpoint, skip JWT processing
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
