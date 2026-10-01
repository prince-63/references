package com.dentalstack.auth.exception;

import com.dentalstack.auth.entity.Auth;

public class UserSignedWithDifferentCredentials extends BusinessException {
    public UserSignedWithDifferentCredentials(Auth auth) {
        super(
                BusinessErrorCode.USER_SIGNED_DIFFERENT_CREDENTIALS,
                String.format(
                        "%s with email `%s` has already signed up with different credentials",
                        auth.getUserType(), auth.getEmail()));
    }
}
