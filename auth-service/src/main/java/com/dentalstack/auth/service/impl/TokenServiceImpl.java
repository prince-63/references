package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.dto.token.ValidateTokenRequest;
import com.dentalstack.auth.entity.Token;
import com.dentalstack.auth.enums.AuthType;
import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.token.InvalidTokenException;
import com.dentalstack.auth.exception.token.TokenExpiredException;
import com.dentalstack.auth.exception.token.UserNotFoundException;
import com.dentalstack.auth.repository.DoctorAuthRepository;
import com.dentalstack.auth.repository.PatientAuthRepository;
import com.dentalstack.auth.service.TokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final DoctorAuthRepository doctorAuthRepository;
    private final PatientAuthRepository patientAuthRepository;

    @Override
    public boolean validateToken(ValidateTokenRequest request) {
        Long userId = request.getUserId();
        UserType userType = request.getUserType();

        switch (userType) {
            case PATIENT -> {
                var patientAuth = patientAuthRepository
                        .findByPatientId(userId)
                        .orElseThrow(() -> new UserNotFoundException(userId, userType));
                handleTokenValidation(patientAuth, userId, userType, patientAuth.getAuthType());
            }
            case DOCTOR -> {
                var doctorAuth = doctorAuthRepository
                        .findByDoctorId(userId)
                        .orElseThrow(() -> new UserNotFoundException(userId, userType));
                handleTokenValidation(doctorAuth, userId, userType, doctorAuth.getAuthType());
            }
        }

        return false;
    }

    private void handleTokenValidation(Token token, Long userId, UserType userType, AuthType authType) {
        if (!token.isTokenValid()) {
            if (token.hasTokenExpired()) {
                throw new TokenExpiredException(userId, userType, authType);
            }
            throw new InvalidTokenException(userId, userType, authType);
        }
    }
}
