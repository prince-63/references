package com.dentalstack.auth.service;

import com.dentalstack.auth.dto.token.ValidateTokenRequest;

public interface TokenService {

    boolean validateToken(ValidateTokenRequest request);
}
