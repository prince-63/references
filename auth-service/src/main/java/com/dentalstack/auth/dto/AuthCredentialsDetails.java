package com.dentalstack.auth.dto;

import com.dentalstack.auth.entity.credentials.AuthCredentials;
import com.dentalstack.auth.entity.credentials.CredentialData;
import com.dentalstack.auth.enums.auth.credentials.CredentialStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthCredentialsDetails {
    private CredentialType type;
    private CredentialData credentialData;
    private CredentialStatus status;

    public static AuthCredentialsDetails from(AuthCredentials authCredentials) {
        return new AuthCredentialsDetails(
                authCredentials.getType(), authCredentials.getCredentialData(), authCredentials.getStatus());
    }
}
