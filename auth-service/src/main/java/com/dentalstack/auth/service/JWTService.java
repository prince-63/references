package com.dentalstack.auth.service;

import com.dentalstack.auth.dto.JWTToken;

public interface JWTService {
    JWTToken createSessionTokenForPatient(String principal, String email, String uuid, String userType, Long userId);

    JWTToken createSessionToken(String principal, String email, String uuid, String userType, Long userId);

    String getTokenSecret();

    JWTToken createSsoToken(String principal, String email, String uuid);

    JWTToken createRefreshToken(String principal);

    String validateToken(String token);

    boolean isSsoToken(String token);

    String getEmailFromToken(String token);

    String getUUIDFromToken(String token);

    boolean isTokenExpired(String token);
}
