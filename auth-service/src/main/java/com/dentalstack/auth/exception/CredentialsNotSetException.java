package com.dentalstack.auth.exception;

import com.dentalstack.auth.entity.Auth;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;

public class CredentialsNotSetException extends BusinessException {
    public CredentialsNotSetException(Auth auth, CredentialType credentialType) {
        super(
                BusinessErrorCode.CREDENTIAL_NOT_SET,
                String.format(
                        "Credentials of type %s not set by %s with email `%s` and mobile no. `%s`",
                        credentialType, auth.getUserType(), auth.getEmail(), auth.getMobileNo()));
    }
}
