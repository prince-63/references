package com.dentalstack.auth.exception.apple;

import static com.dentalstack.auth.exception.BusinessErrorCode.APPLE_TOKEN_EXPIRED;

import com.dentalstack.auth.exception.BusinessException;
import com.dentalstack.auth.service.apple.AppleIdToken;

public class AppleTokenExpiredException extends BusinessException {
    public AppleTokenExpiredException(AppleIdToken idToken) {
        super(
                APPLE_TOKEN_EXPIRED,
                String.format("Apple token %s... expired", idToken.getIdToken().substring(0, 10)));
    }
}
