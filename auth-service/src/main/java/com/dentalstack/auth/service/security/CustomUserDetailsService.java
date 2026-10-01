package com.dentalstack.auth.service.security;

import com.dentalstack.auth.dto.security.CustomUserDetails;
import com.dentalstack.auth.entity.credentials.PasswordCredentialData;
import com.dentalstack.auth.enums.auth.AuthStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import com.dentalstack.auth.repository.AuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AuthRepository authRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var auth = authRepository
                .findByUuid(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with uuid: " + username));

        // Assuming your Auth entity has a getStatus() method that returns AuthStatus
        boolean isEnabled = auth.getStatus() == AuthStatus.ACTIVE;

        return CustomUserDetails.builder()
                .username(auth.getUuid())
                .password(auth.getCredential(CredentialType.PASSWORD, CredentialStatus.ACTIVE)
                        .map(credential -> ((PasswordCredentialData) credential.getCredentialData()).getPassword())
                        .orElse(""))
                .userType(auth.getUserType().name())
                .enabled(isEnabled)
                .build();
    }
}
