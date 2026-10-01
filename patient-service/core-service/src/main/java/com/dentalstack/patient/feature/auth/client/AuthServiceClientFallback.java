package com.dentalstack.patient.feature.auth.client;

import com.dentalstack.patient.feature.auth.dto.auth.UpdateAuthRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AuthServiceClientFallback implements AuthServiceClient {

    private static final String FALLBACK_MSG = "AuthServiceClient fallback triggered";

    @Override
    public void updateAuthPatient(UpdateAuthRequest request) {
        log.error("{}: updateAuthPatient — auth update failed, manual intervention may be needed", FALLBACK_MSG);
    }

    @Override
    public void deleteByUUID(String UUID) {
        log.error("{}: deleteByUUID for UUID={} — deletion deferred", FALLBACK_MSG, UUID);
    }

    @Override
    public void deleteByEmail(String email) {
        log.error("{}: deleteByEmail for email={} — deletion deferred", FALLBACK_MSG, email);
    }

    @Override
    public boolean validateOrganizationCredentials(String orgName, String orgToken) {
        log.error("{}: validateOrganizationCredentials — returning false as safe default", FALLBACK_MSG);
        return false;
    }

    @Override
    public boolean checkWithEmail(String email) {
        log.error("{}: checkWithEmail for email={} — returning false as safe default", FALLBACK_MSG, email);
        return false;
    }
}
