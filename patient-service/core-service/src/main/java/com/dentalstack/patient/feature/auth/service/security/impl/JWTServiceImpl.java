package com.dentalstack.patient.feature.auth.service.security.impl;

import com.dentalstack.patient.feature.auth.service.security.JWTService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JWTServiceImpl implements JWTService {

    @Value("${dentalstack.jwt.secret.token}")
    private String tokenSecret;

    @Override
    public String getTokenSecret() {
        return tokenSecret;
    }
}
