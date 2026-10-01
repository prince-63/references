package com.dentalstack.patient.feature.auth.service;

import com.dentalstack.patient.feature.auth.dto.auth.UpdateAuthRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;

public interface AuthService {
    void updateAuthPatient(@Valid @RequestBody UpdateAuthRequest request);

    void deleteByUUID(String UUID);

    void deleteByEmail(String email);
}
