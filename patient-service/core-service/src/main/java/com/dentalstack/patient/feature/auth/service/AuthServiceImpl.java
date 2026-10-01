package com.dentalstack.patient.feature.auth.service;

import com.dentalstack.patient.feature.auth.client.AuthServiceClient;
import com.dentalstack.patient.feature.auth.dto.auth.UpdateAuthRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthServiceClient authServiceClient;

    @Override
    public void updateAuthPatient(@Valid @RequestBody UpdateAuthRequest request) {
        authServiceClient.updateAuthPatient(request);
    }

    @Override
    public void deleteByUUID(String UUID) {
        authServiceClient.deleteByUUID(UUID);
    }

    @Override
    public void deleteByEmail(String email) {
        authServiceClient.deleteByEmail(email);
    }
}
