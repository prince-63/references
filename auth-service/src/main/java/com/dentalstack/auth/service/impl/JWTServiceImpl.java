package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.dto.JWTToken;
import com.dentalstack.auth.service.JWTService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.ZoneId;
import java.util.*;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class JWTServiceImpl implements JWTService {

    private SecretKey signingKey;
    private String decodedSecretKey;
    private Long validityInMs;
    private Long validityInMsForPatient;

    private Long ssoTokenValidityInMinutes;
    private Long refreshTokenValidityInHours;

    @Value("${dentalstack.jwt.secret.token}")
    public void setTokenSecret(String tokenSecret) {
        this.decodedSecretKey = tokenSecret;
        byte[] decodedKey = Base64.getDecoder().decode(tokenSecret);
        if (decodedKey.length < 64) {
            throw new IllegalArgumentException(
                    "Secret key is too short for HS512. It must be at least 512 bits (64 bytes).");
        }
        this.signingKey = Keys.hmacShaKeyFor(decodedKey);
    }

    @Value("${dentalstack.jwt.secret.validity_in_ms}")
    public void setValidityInMs(Long validityInMs) {
        this.validityInMs = validityInMs;
    }

    @Value("${dentalstack.jwt.secret.validity_in_ms_patient}")
    public void setValidityInMsForPatient(Long validityInMsForPatient) {
        this.validityInMsForPatient = validityInMsForPatient;
    }

    @Value("${dentalstack.jwt.sso.validity_in_minutes:5}")
    public void setSsoTokenValidityInMinutes(Long ssoTokenValidityInMinutes) {
        this.ssoTokenValidityInMinutes = ssoTokenValidityInMinutes;
    }

    @Value("${dentalstack.jwt.refresh.validity_in_hours:24}")
    public void setRefreshTokenValidityInHours(Long refreshTokenValidityInHours) {
        this.refreshTokenValidityInHours = refreshTokenValidityInHours;
    }

    @Override
    public JWTToken createSessionTokenForPatient(
            String principal, String email, String uuid, String userType, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("uuid", uuid);
        claims.put("token_type", "session_token");
        claims.put("authenticated", true);
        claims.put("user_type", userType);
        claims.put("user_id", userId);

        Date currentDate = new Date();
        long oneYearInMs = 365L * 24 * 60 * 60 * 1000; // 1 year
        Date expiryDate = new Date(currentDate.getTime() + oneYearInMs);

        String token = Jwts.builder()
                .subject(principal)
                .claims(claims)
                .issuedAt(currentDate)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();

        return new JWTToken(token, expiryDate.toInstant().atZone(ZoneId.of("Asia/Kolkata")));
    }

    @Override
    public JWTToken createSessionToken(String principal, String email, String uuid, String userType, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("uuid", uuid);
        claims.put("token_type", "session_token");
        claims.put("authenticated", true);
        claims.put("user_type", userType);
        claims.put("user_id", userId);

        Date currentDate = new Date();
        long oneYearInMs = 365L * 24 * 60 * 60 * 1000; // 1 year
        Date expiryDate = new Date(currentDate.getTime() + oneYearInMs);

        String token = Jwts.builder()
                .subject(principal)
                .claims(claims)
                .issuedAt(currentDate)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();

        return new JWTToken(token, expiryDate.toInstant().atZone(ZoneId.of("Asia/Kolkata")));
    }

    @Override
    public String getTokenSecret() {
        return decodedSecretKey;
    }

    @Override
    public JWTToken createSsoToken(String principal, String email, String uuid) {
        Date currentDate = new Date();
        Date expiryDate = new Date(currentDate.getTime() + (10L * 365 * 24 * 60 * 60 * 1000));

        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("token_type", "sso");
        claims.put("authenticated", true);
        claims.put("uuid", uuid);

        String token = Jwts.builder()
                .claims(claims)
                .subject(principal)
                .id(UUID.randomUUID().toString())
                .issuedAt(currentDate)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();

        return new JWTToken(token, expiryDate.toInstant().atZone(ZoneId.of("Asia/Kolkata")));
    }

    @Override
    public JWTToken createRefreshToken(String principal) {
        Date currentDate = new Date();
        Date expiryDate = new Date(currentDate.getTime() + (refreshTokenValidityInHours * 60 * 60 * 1000));

        Map<String, Object> claims = new HashMap<>();
        claims.put("token_type", "refresh");
        claims.put("authenticated", true);

        String token = Jwts.builder()
                .claims(claims)
                .subject(principal)
                .id(UUID.randomUUID().toString())
                .issuedAt(currentDate)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();

        return new JWTToken(token, expiryDate.toInstant().atZone(ZoneId.of("Asia/Kolkata")));
    }

    @Override
    public String validateToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    @Override
    public boolean isSsoToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return "sso".equals(claims.get("token_type"));
    }

    @Override
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.get("email", String.class);
    }

    @Override
    public String getUUIDFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.get("uuid", String.class);
    }

    @Override
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}
