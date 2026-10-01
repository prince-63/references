package com.dentalstack.auth.exception.google;

import static com.dentalstack.auth.exception.BusinessErrorCode.GOOGLE_TOKEN_EXPIRED;

import com.dentalstack.auth.exception.BusinessException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

public class GoogleTokenExpiredException extends BusinessException {
    public GoogleTokenExpiredException(GoogleIdToken idToken) {
        super(
                GOOGLE_TOKEN_EXPIRED,
                String.format(
                        "Google token %s expired for email %s",
                        idToken.toString().substring(0, 10),
                        idToken.getPayload().getEmail()));
    }
}
