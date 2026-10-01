package com.dentalstack.auth.exception.apple;

import com.dentalstack.auth.exception.BusinessErrorCode;
import com.dentalstack.auth.exception.BusinessException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

public class GoogleTokenVerificationFailedException extends BusinessException {
    public GoogleTokenVerificationFailedException(GoogleIdToken idToken, String reason) {
        super(
                BusinessErrorCode.GOOGLE_TOKEN_VALIDATION_FAILED,
                String.format(
                        "Google token verification failed for token %s. reason: %s",
                        idToken.toString().substring(10), reason));
    }
}
