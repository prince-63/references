package com.dentalstack.auth.exception.doctor;

import com.dentalstack.auth.enums.AuthType;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import com.dentalstack.auth.exception.BusinessErrorCode;
import com.dentalstack.auth.exception.BusinessException;

public class InvalidLoginMethodException extends BusinessException {
    public InvalidLoginMethodException(String msg) {
        super(BusinessErrorCode.INVALID_LOGIN_METHOD, msg);
    }

    public static InvalidLoginMethodException withEmail(String emailId, CredentialType credentialType) {
        return new InvalidLoginMethodException(String.format(
                "Invalid login method used by doctor with email %s. Credentials with type %s are not active",
                emailId, credentialType));
    }

    public static InvalidLoginMethodException withEmailByPatient(String emailId, CredentialType credentialType) {
        return new InvalidLoginMethodException(String.format(
                "Invalid login method used by patient with email %s. Credentials with type %s are not active",
                emailId, credentialType));
    }

    public static InvalidLoginMethodException withMobileNo(String mobileNo, AuthType authType) {
        return new InvalidLoginMethodException(String.format(
                "Invalid login method used by doctor with mobile no %s. expected auth type: %s", mobileNo, authType));
    }
}
